import { Prisma, CatalogueCategory } from "../../../../generated/prisma/index.js";
import { prisma } from "../../../shared/lib/prisma.js";
import { ConflictError } from "../../../shared/error/conflict.error.js";
import { MissingError } from "../../../shared/error/missing.error.js";
import type {
    CreateInventoryLocationBody,
    EditInventoryLocationBody,
} from "./inventoryLocations.schema.js";

type InventoryLocationType = "WAREHOUSE" | "PROJECT";
type InventoryMovementType =
    | "RECEIPT"
    | "ISSUE"
    | "TRANSFER_IN"
    | "TRANSFER_OUT"
    | "ADJUSTMENT_ADD"
    | "ADJUSTMENT_SUB"
    | "RETURN_IN"
    | "RETURN_OUT";

function buildLocationStockSearchFilter(search: string): Prisma.InventoryStockWhereInput {
    if (search.length === 0) return {};

    const upperSearch = search.toUpperCase();
    const matchedCategory = Object.values(CatalogueCategory).find(
        (v) => v === upperSearch,
    );

    const orClauses: Prisma.InventoryStockWhereInput[] = [
        { catalogue: { name: { contains: search, mode: "insensitive" } } },
        { catalogue: { unit: { contains: search, mode: "insensitive" } } },
    ];

    if (matchedCategory) {
        orClauses.push({ catalogue: { category: { equals: matchedCategory } } });
    }

    return { OR: orClauses };
}

const inventoryLocationsService = {
    async getInventoryLocations(
        orgId: string,
        options: {
            pageIndex: number;
            pageSize: number;
            search: string;
            includeDeleted: boolean;
            includeInactive: boolean;
            type?: InventoryLocationType;
            projectId?: string;
        },
    ) {
        const { pageIndex, pageSize, search, includeDeleted, includeInactive, type, projectId } = options;
        const skip = pageIndex * pageSize;

        const searchFilter: Prisma.InventoryLocationWhereInput =
            search.length > 0
                ? {
                      OR: [
                          { name: { contains: search, mode: "insensitive" } },
                          { code: { contains: search, mode: "insensitive" } },
                      ],
                  }
                : {};

        const where: Prisma.InventoryLocationWhereInput = {
            organizationId: orgId,
            ...(!includeDeleted && { deletedAt: null }),
            ...(!includeInactive && { isActive: true }),
            ...(type && { type }),
            ...(projectId && { projectId }),
            ...searchFilter,
        };

        const [locations, count] = await Promise.all([
            prisma.inventoryLocation.findMany({
                where,
                skip,
                take: pageSize,
                select: {
                    id: true,
                    name: true,
                    code: true,
                    type: true,
                    projectId: true,
                    isActive: true,
                    deletedAt: true,
                    createdAt: true,
                    updatedAt: true,
                },
                orderBy: { createdAt: "desc" },
            }),
            prisma.inventoryLocation.count({ where }),
        ]);

        return { data: locations, count };
    },

    async getInventoryLocationById(orgId: string, locationId: string) {
        const location = await prisma.inventoryLocation.findFirst({
            where: { id: locationId, organizationId: orgId },
            select: {
                id: true,
                name: true,
                code: true,
                type: true,
                projectId: true,
                isActive: true,
                deletedAt: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!location) throw new MissingError("Inventory location not found");
        return location;
    },

    async createInventoryLocation(orgId: string, input: CreateInventoryLocationBody) {
        try {
            const location = await prisma.inventoryLocation.create({
                data: {
                    organizationId: orgId,
                    name: input.name,
                    code: input.code ?? null,
                    type: input.type,
                    projectId: input.projectId ?? null,
                    isActive: input.isActive,
                },
                select: {
                    id: true,
                    name: true,
                    code: true,
                    type: true,
                    projectId: true,
                    isActive: true,
                    createdAt: true,
                },
            });
            return location;
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === "P2002"
            ) {
                throw new ConflictError(
                    "An inventory location with this name or code already exists in your organization",
                );
            }
            throw error;
        }
    },

    async editInventoryLocation(
        orgId: string,
        locationId: string,
        input: EditInventoryLocationBody,
    ) {
        const existing = await prisma.inventoryLocation.findFirst({
            where: { id: locationId, organizationId: orgId, deletedAt: null },
            select: { id: true },
        });

        if (!existing) throw new MissingError("Inventory location not found or has been deleted");

        try {
            const updated = await prisma.inventoryLocation.update({
                where: { id: locationId },
                data: {
                    ...(input.name !== undefined && { name: input.name }),
                    ...(input.code !== undefined && { code: input.code }),
                    ...(input.type !== undefined && { type: input.type }),
                    ...(input.projectId !== undefined && { projectId: input.projectId }),
                    ...(input.isActive !== undefined && { isActive: input.isActive }),
                },
                select: {
                    id: true,
                    name: true,
                    code: true,
                    type: true,
                    projectId: true,
                    isActive: true,
                    updatedAt: true,
                },
            });
            return updated;
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === "P2002"
            ) {
                throw new ConflictError(
                    "An inventory location with this name or code already exists in your organization",
                );
            }
            throw error;
        }
    },

    async deleteInventoryLocation(orgId: string, locationId: string) {
        const existing = await prisma.inventoryLocation.findFirst({
            where: { id: locationId, organizationId: orgId },
            select: { id: true, deletedAt: true },
        });

        if (!existing) throw new MissingError("Inventory location not found");
        if (existing.deletedAt !== null) {
            throw new ConflictError("Inventory location is already deleted");
        }

        const [stockWithQuantity, movementCount] = await Promise.all([
            prisma.inventoryStock.findFirst({
                where: {
                    locationId,
                    organizationId: orgId,
                    quantity: { gt: 0 },
                },
                select: { id: true },
            }),
            prisma.inventoryMovement.count({
                where: {
                    organizationId: orgId,
                    OR: [{ fromLocationId: locationId }, { toLocationId: locationId }],
                },
            }),
        ]);

        if (stockWithQuantity) {
            throw new ConflictError(
                "Cannot delete inventory location because it still has stock.",
            );
        }

        if (movementCount > 0) {
            throw new ConflictError(
                "Cannot delete inventory location because movement history exists for it.",
            );
        }

        await prisma.inventoryLocation.update({
            where: { id: locationId },
            data: { deletedAt: new Date(), isActive: false },
        });
    },

    async getStocksByLocationId(
        orgId: string,
        locationId: string,
        pageIndex: number,
        pageSize: number,
        search: string,
    ) {
        const existing = await prisma.inventoryLocation.findFirst({
            where: { id: locationId, organizationId: orgId },
            select: { id: true },
        });

        if (!existing) throw new MissingError("Inventory location not found");

        const skip = pageIndex * pageSize;

        const searchFilter = buildLocationStockSearchFilter(search);

        const baseWhere: Prisma.InventoryStockWhereInput = {
            locationId,
            organizationId: orgId,
            ...searchFilter,
        };

        const [stocks, count] = await Promise.all([
            prisma.inventoryStock.findMany({
                where: baseWhere,
                skip,
                take: pageSize,
                select: {
                    id: true,
                    quantity: true,
                    minimumQuantity: true,
                    reservedQuantity: true,
                    createdAt: true,
                    updatedAt: true,
                    catalogue: {
                        select: { id: true, name: true, unit: true, category: true },
                    },
                },
                orderBy: { createdAt: "desc" },
            }),
            prisma.inventoryStock.count({ where: baseWhere }),
        ]);

        const data = stocks.map((s) => ({
            ...s,
            quantity: Number(s.quantity),
            minimumQuantity: s.minimumQuantity === null ? null : Number(s.minimumQuantity),
            reservedQuantity: s.reservedQuantity === null ? null : Number(s.reservedQuantity),
        }));

        return { data, count };
    },

    async getMovementsByLocationId(
        orgId: string,
        locationId: string,
        pageIndex: number,
        pageSize: number,
        search: string,
        type?: InventoryMovementType,
    ) {
        const existing = await prisma.inventoryLocation.findFirst({
            where: { id: locationId, organizationId: orgId },
            select: { id: true },
        });

        if (!existing) throw new MissingError("Inventory location not found");

        const skip = pageIndex * pageSize;

        const searchFilter: Prisma.InventoryMovementWhereInput =
            search.length > 0
                ? {
                      OR: [
                          { catalogue: { name: { contains: search, mode: "insensitive" } } },
                          { referenceType: { contains: search, mode: "insensitive" } },
                          { referenceId: { contains: search, mode: "insensitive" } },
                          { remarks: { contains: search, mode: "insensitive" } },
                      ],
                  }
                : {};

        const where: Prisma.InventoryMovementWhereInput = {
            organizationId: orgId,
            OR: [{ fromLocationId: locationId }, { toLocationId: locationId }],
            ...(type && { type }),
            ...searchFilter,
        };

        const [movements, count] = await Promise.all([
            prisma.inventoryMovement.findMany({
                where,
                skip,
                take: pageSize,
                select: {
                    id: true,
                    type: true,
                    quantity: true,
                    unitCost: true,
                    remarks: true,
                    movementDate: true,
                    referenceType: true,
                    referenceId: true,
                    transferGroupId: true,
                    fromLocationId: true,
                    toLocationId: true,
                    catalogue: { select: { id: true, name: true, unit: true } },
                },
                orderBy: { movementDate: "desc" },
            }),
            prisma.inventoryMovement.count({ where }),
        ]);

        const data = movements.map((m) => ({
            ...m,
            quantity: Number(m.quantity),
            unitCost: m.unitCost === null ? null : Number(m.unitCost),
        }));

        return { data, count };
    },
};

export default inventoryLocationsService;
