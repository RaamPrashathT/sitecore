import { Prisma } from "../../../../generated/prisma/index.js";
import { prisma } from "../../../shared/lib/prisma.js";
import { ConflictError } from "../../../shared/error/conflict.error.js";
import { MissingError } from "../../../shared/error/missing.error.js";
import type {
    CreateCatalogueBody,
    EditCatalogueBody,
} from "./catalogue.schema.js";

const catalogueService = {
    async getCatalogue(orgId: string, search: string) {
        const where: Prisma.CatalogueWhereInput = {
            organizationId: orgId,
            ...(search.length > 0 && {
                name: { contains: search, mode: "insensitive" },
            }),
        };

        const list = await prisma.catalogue.findMany({
            where,
            select: {
                id: true,
                name: true,
            },
        });

        return { list, count: list.length };
    },

    async getCatalogueById(orgId: string, catalogueId: string) {
        const item = await prisma.catalogue.findFirst({
            where: { id: catalogueId, organizationId: orgId },
            select: {
                id: true,
                name: true,
                category: true,
                unit: true,
                defaultLeadTime: true,
                inventoryStocks: {
                    where: {
                        location: { deletedAt: null, isActive: true },
                    },
                    select: {
                        quantity: true,
                        location: {
                            select: { id: true, name: true, type: true, updatedAt: true },
                        },
                    },
                },
                supplierQuotes: {
                    where: { supplier: { deletedAt: null } },
                    select: {
                        id: true,
                        truePrice: true,
                        standardRate: true,
                        leadTime: true,
                        inventory: true,
                        supplierId: true,
                        supplier: {
                            select: { id: true, name: true },
                        },
                    },
                },
            },
        });

        if (!item) throw new MissingError("Catalogue item not found");

        // ── Stock summary ──────────────────────────────────────────────────
        let totalQuantity = 0;
        const locations = item.inventoryStocks.map((stock) => {
            const qty = Number(stock.quantity);
            totalQuantity += qty;
            return {
                locationId: stock.location.id,
                locationName: stock.location.name,
                locationType: stock.location.type,
                locationUpdatedAt: stock.location.updatedAt.toISOString(),
                quantity: qty,
            };
        });

        // ── Supplier / quote summary ───────────────────────────────────────
        const rawQuotes = item.supplierQuotes.map((q) => ({
            id: q.id,
            supplierId: q.supplierId,
            supplierName: q.supplier.name,
            truePrice: Number(q.truePrice),
            standardRate: Number(q.standardRate),
            leadTime: q.leadTime,
            inventory: q.inventory,
            profit: Number(q.standardRate) - Number(q.truePrice),
        }));

        let shortestLeadTime: number | null = null;
        let maxProfit = 0;
        let minProfit = 0;
        let isDifferentiable = false;

        if (rawQuotes.length > 0) {
            maxProfit = Math.max(...rawQuotes.map((q) => q.profit));
            minProfit = Math.min(...rawQuotes.map((q) => q.profit));
            isDifferentiable = rawQuotes.length > 1 && maxProfit !== minProfit;

            const validLeadTimes = rawQuotes
                .filter((q) => q.leadTime !== null)
                .map((q) => q.leadTime as number);

            if (validLeadTimes.length > 0) {
                shortestLeadTime = Math.min(...validLeadTimes);
            }
        }

        const quotes = rawQuotes.map((q) => ({
            ...q,
            isHighestProfit: isDifferentiable && q.profit === maxProfit,
            isShortestLeadTime:
                q.leadTime !== null && q.leadTime === shortestLeadTime,
        }));

        return {
            id: item.id,
            name: item.name,
            category: item.category,
            unit: item.unit,
            defaultLeadTime: item.defaultLeadTime,
            stockSummary: {
                totalQuantity,
                locations,
            },
            supplierSummary: {
                activeSuppliersCount: quotes.length,
                quotes,
            },
        };
    },

    async createCatalogue(orgId: string, input: CreateCatalogueBody) {
        try {
            const item = await prisma.catalogue.create({
                data: {
                    name: input.name,
                    category: input.category,
                    unit: input.unit,
                    defaultLeadTime: input.defaultLeadTime,
                    organizationId: orgId,
                },
                select: {
                    id: true,
                    name: true,
                    category: true,
                    unit: true,
                    defaultLeadTime: true,
                },
            });
            return item;
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === "P2002"
            ) {
                throw new ConflictError(
                    "A catalogue item with this name already exists in your organization",
                );
            }
            throw error;
        }
    },

    async editCatalogue(
        orgId: string,
        catalogueId: string,
        input: EditCatalogueBody,
    ) {
        const existing = await prisma.catalogue.findFirst({
            where: { id: catalogueId, organizationId: orgId },
            select: { id: true },
        });

        if (!existing) throw new MissingError("Catalogue item not found");

        try {
            const updated = await prisma.catalogue.update({
                where: { id: catalogueId },
                data: {
                    ...(input.name !== undefined && { name: input.name }),
                    ...(input.category !== undefined && {
                        category: input.category,
                    }),
                    ...(input.unit !== undefined && { unit: input.unit }),
                    ...(input.defaultLeadTime !== undefined && {
                        defaultLeadTime: input.defaultLeadTime,
                    }),
                },
                select: {
                    id: true,
                    name: true,
                    category: true,
                    unit: true,
                    defaultLeadTime: true,
                },
            });
            return updated;
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === "P2002"
            ) {
                throw new ConflictError(
                    "A catalogue item with this name already exists in your organization",
                );
            }
            throw error;
        }
    },

    async deleteCatalogue(orgId: string, catalogueId: string) {
        const existing = await prisma.catalogue.findFirst({
            where: { id: catalogueId, organizationId: orgId },
            select: { id: true },
        });

        if (!existing) throw new MissingError("Catalogue item not found");

        const [quoteCount, itemCount] = await Promise.all([
            prisma.supplierQuote.count({ where: { catalogueId } }),
            prisma.requisitionItem.count({ where: { catalogueId } }),
        ]);

        if (quoteCount > 0 || itemCount > 0) {
            throw new ConflictError(
                "Cannot delete catalogue item: it is referenced by supplier quotes or requisition items",
            );
        }

        await prisma.catalogue.delete({ where: { id: catalogueId } });
    },

    async getQuotesByCatalogueId(orgId: string, catalogueId: string) {
        const existing = await prisma.catalogue.findFirst({
            where: { id: catalogueId, organizationId: orgId },
            select: { id: true },
        });

        if (!existing) throw new MissingError("Catalogue item not found");

        const quotes = await prisma.supplierQuote.findMany({
            where: {
                catalogueId,
                supplier: { deletedAt: null },
            },
            select: {
                id: true,
                truePrice: true,
                standardRate: true,
                leadTime: true,
                inventory: true,
                supplierId: true,
                supplier: { select: { id: true, name: true } },
            },
        });

        const data = quotes.map((q) => ({
            ...q,
            truePrice: Number(q.truePrice),
            standardRate: Number(q.standardRate),
        }));

        return { data, count: data.length };
    },

    async getSuppliersByCatalogueId(orgId: string, catalogueId: string) {
        const existing = await prisma.catalogue.findFirst({
            where: { id: catalogueId, organizationId: orgId },
            select: { id: true },
        });

        if (!existing) throw new MissingError("Catalogue item not found");

        const quotes = await prisma.supplierQuote.findMany({
            where: {
                catalogueId,
                supplier: { deletedAt: null },
            },
            select: {
                supplier: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        contactPerson: true,
                        address: true,
                    },
                },
            },
        });

        const seen = new Set<string>();
        const data = quotes
            .map((q) => q.supplier)
            .filter((s) => {
                if (seen.has(s.id)) return false;
                seen.add(s.id);
                return true;
            });

        return { data, count: data.length };
    },
};

export default catalogueService;
