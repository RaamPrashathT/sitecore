import { Prisma, CatalogueCategory } from "../../../../generated/prisma/index.js";
import { prisma } from "../../../shared/lib/prisma.js";
import { MissingError } from "../../../shared/error/missing.error.js";

type InventoryLocationType = "WAREHOUSE" | "PROJECT";

function buildCatalogueSearchFilter(search: string): Prisma.InventoryStockWhereInput {
    if (search.length === 0) return {};

    const upperSearch = search.toUpperCase();
    const matchedCategory = Object.values(CatalogueCategory).find(
        (v) => v === upperSearch,
    );

    const orClauses: Prisma.InventoryStockWhereInput[] = [
        { catalogue: { name: { contains: search, mode: "insensitive" } } },
        { catalogue: { unit: { contains: search, mode: "insensitive" } } },
        { location: { name: { contains: search, mode: "insensitive" } } },
        { location: { code: { contains: search, mode: "insensitive" } } },
    ];

    if (matchedCategory) {
        orClauses.push({ catalogue: { category: { equals: matchedCategory } } });
    }

    return { OR: orClauses };
}

const inventoryStocksService = {
    async getInventoryStocks(
        orgId: string,
        pageIndex: number,
        pageSize: number,
        search: string,
        locationId?: string,
        catalogueId?: string,
        locationType?: InventoryLocationType,
    ) {
        const skip = pageIndex * pageSize;

        const searchFilter = buildCatalogueSearchFilter(search);

        const where: Prisma.InventoryStockWhereInput = {
            organizationId: orgId,
            location: {
                deletedAt: null,
                ...(locationType && { type: locationType }),
            },
            ...(locationId && { locationId }),
            ...(catalogueId && { catalogueId }),
            ...searchFilter,
        };

        const [stocks, count] = await Promise.all([
            prisma.inventoryStock.findMany({
                where,
                skip,
                take: pageSize,
                select: {
                    id: true,
                    quantity: true,
                    minimumQuantity: true,
                    reservedQuantity: true,
                    locationId: true,
                    catalogueId: true,
                    createdAt: true,
                    updatedAt: true,
                    location: { select: { id: true, name: true, type: true } },
                    catalogue: { select: { id: true, name: true, unit: true, category: true } },
                },
                orderBy: { updatedAt: "desc" },
            }),
            prisma.inventoryStock.count({ where }),
        ]);

        const data = stocks.map((s) => ({
            ...s,
            quantity: Number(s.quantity),
            minimumQuantity: s.minimumQuantity === null ? null : Number(s.minimumQuantity),
            reservedQuantity: s.reservedQuantity === null ? null : Number(s.reservedQuantity),
        }));

        return { data, count };
    },

    async getInventoryStockById(orgId: string, stockId: string) {
        const stock = await prisma.inventoryStock.findFirst({
            where: { id: stockId, organizationId: orgId },
            select: {
                id: true,
                quantity: true,
                minimumQuantity: true,
                reservedQuantity: true,
                locationId: true,
                catalogueId: true,
                createdAt: true,
                updatedAt: true,
                location: { select: { id: true, name: true, type: true } },
                catalogue: { select: { id: true, name: true, unit: true, category: true } },
            },
        });

        if (!stock) throw new MissingError("Inventory stock not found");

        return {
            ...stock,
            quantity: Number(stock.quantity),
            minimumQuantity: stock.minimumQuantity === null ? null : Number(stock.minimumQuantity),
            reservedQuantity: stock.reservedQuantity === null ? null : Number(stock.reservedQuantity),
        };
    },

    async getStocksByCatalogueId(
        orgId: string,
        catalogueId: string,
        pageIndex: number,
        pageSize: number,
        search: string,
        locationType?: InventoryLocationType,
    ) {
        const catalogue = await prisma.catalogue.findFirst({
            where: { id: catalogueId, organizationId: orgId },
            select: { id: true },
        });

        if (!catalogue) throw new MissingError("Catalogue item not found");

        const skip = pageIndex * pageSize;

        const searchFilter: Prisma.InventoryStockWhereInput =
            search.length > 0
                ? {
                      OR: [
                          { location: { name: { contains: search, mode: "insensitive" } } },
                          { location: { code: { contains: search, mode: "insensitive" } } },
                      ],
                  }
                : {};

        const where: Prisma.InventoryStockWhereInput = {
            catalogueId,
            organizationId: orgId,
            location: {
                deletedAt: null,
                ...(locationType && { type: locationType }),
            },
            ...searchFilter,
        };

        const [stocks, count] = await Promise.all([
            prisma.inventoryStock.findMany({
                where,
                skip,
                take: pageSize,
                select: {
                    id: true,
                    quantity: true,
                    minimumQuantity: true,
                    reservedQuantity: true,
                    locationId: true,
                    createdAt: true,
                    updatedAt: true,
                    location: { select: { id: true, name: true, type: true } },
                },
                orderBy: { updatedAt: "desc" },
            }),
            prisma.inventoryStock.count({ where }),
        ]);

        const data = stocks.map((s) => ({
            ...s,
            quantity: Number(s.quantity),
            minimumQuantity: s.minimumQuantity === null ? null : Number(s.minimumQuantity),
            reservedQuantity: s.reservedQuantity === null ? null : Number(s.reservedQuantity),
        }));

        return { data, count };
    },
};

export default inventoryStocksService;
