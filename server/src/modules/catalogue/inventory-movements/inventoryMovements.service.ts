import { Prisma } from "../../../../generated/prisma/index.js";
import { prisma } from "../../../shared/lib/prisma.js";
import { ConflictError } from "../../../shared/error/conflict.error.js";
import { MissingError } from "../../../shared/error/missing.error.js";
import { ValidationError } from "../../../shared/error/validation.error.js";
import type {
    CreateReceiptBody,
    CreateIssueBody,
    CreateTransferBody,
    CreateAdjustmentBody,
} from "./inventoryMovements.schema.js";

type InventoryMovementType =
    | "RECEIPT"
    | "ISSUE"
    | "TRANSFER_IN"
    | "TRANSFER_OUT"
    | "ADJUSTMENT_ADD"
    | "ADJUSTMENT_SUB"
    | "RETURN_IN"
    | "RETURN_OUT";

function mapMovement(m: {
    id: string;
    type: InventoryMovementType;
    quantity: Prisma.Decimal;
    unitCost: Prisma.Decimal | null;
    remarks: string | null;
    movementDate: Date;
    referenceType: string | null;
    referenceId: string | null;
    transferGroupId: string | null;
    fromLocationId: string | null;
    toLocationId: string | null;
    catalogue: { id: string; name: string; unit: string };
    fromLocation: { id: string; name: string; type: string } | null;
    toLocation: { id: string; name: string; type: string } | null;
}) {
    return {
        ...m,
        quantity: Number(m.quantity),
        unitCost: m.unitCost === null ? null : Number(m.unitCost),
    };
}

const movementSelect = {
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
    fromLocation: { select: { id: true, name: true, type: true } },
    toLocation: { select: { id: true, name: true, type: true } },
} as const;

const inventoryMovementsService = {
    async getInventoryMovements(
        orgId: string,
        pageIndex: number,
        pageSize: number,
        catalogueId?: string,
        locationId?: string,
        type?: InventoryMovementType,
        search?: string,
    ) {
        const skip = pageIndex * pageSize;

        const searchFilter: Prisma.InventoryMovementWhereInput =
            search && search.length > 0
                ? {
                      OR: [
                          {
                              catalogue: {
                                  name: {
                                      contains: search,
                                      mode: "insensitive",
                                  },
                              },
                          },
                          {
                              referenceType: {
                                  contains: search,
                                  mode: "insensitive",
                              },
                          },
                          {
                              referenceId: {
                                  contains: search,
                                  mode: "insensitive",
                              },
                          },
                          {
                              remarks: {
                                  contains: search,
                                  mode: "insensitive",
                              },
                          },
                      ],
                  }
                : {};

        const where: Prisma.InventoryMovementWhereInput = {
            organizationId: orgId,
            ...(catalogueId && { catalogueId }),
            ...(type && { type }),
            ...(locationId && {
                OR: [
                    { fromLocationId: locationId },
                    { toLocationId: locationId },
                ],
            }),
            ...searchFilter,
        };

        const [movements, count] = await Promise.all([
            prisma.inventoryMovement.findMany({
                where,
                skip,
                take: pageSize,
                select: movementSelect,
                orderBy: { movementDate: "desc" },
            }),
            prisma.inventoryMovement.count({ where }),
        ]);

        return { data: movements.map(mapMovement), count };
    },

    async getInventoryMovementById(orgId: string, movementId: string) {
        const movement = await prisma.inventoryMovement.findFirst({
            where: { id: movementId, organizationId: orgId },
            select: movementSelect,
        });

        if (!movement) throw new MissingError("Inventory movement not found");
        return mapMovement(movement);
    },

    async createReceipt(
        orgId: string,
        memberId: string,
        input: CreateReceiptBody,
    ) {
        await assertCatalogueInOrg(orgId, input.catalogueId);
        await assertLocationInOrg(orgId, input.toLocationId);

        const membershipId = await prisma.membership.findFirst({
            where: {
                userId: memberId,
                organizationId: orgId,
            },
            select: {
                id: true,
            },
        });
        if (input.supplierQuoteId) {
            await assertSupplierQuoteInOrg(orgId, input.supplierQuoteId);
        }

        const movementDate = input.movementDate ?? new Date();

        const movement = await prisma.$transaction(async (tx) => {
            const created = await tx.inventoryMovement.create({
                data: {
                    organizationId: orgId,
                    type: "RECEIPT",
                    catalogueId: input.catalogueId,
                    quantity: input.quantity,
                    toLocationId: input.toLocationId,
                    unitCost: input.unitCost ?? null,
                    supplierQuoteId: input.supplierQuoteId ?? null,
                    referenceType: input.referenceType ?? null,
                    referenceId: input.referenceId ?? null,
                    remarks: input.remarks ?? null,
                    movementDate,
                    createdByMemberId: membershipId?.id ?? null,
                },
                select: movementSelect,
            });

            await upsertStock(
                tx,
                orgId,
                input.catalogueId,
                input.toLocationId,
                input.quantity,
            );

            return created;
        });

        return mapMovement(movement);
    },

    async createIssue(orgId: string, memberId: string, input: CreateIssueBody) {
        await assertCatalogueInOrg(orgId, input.catalogueId);
        await assertLocationInOrg(orgId, input.fromLocationId);

        const movementDate = input.movementDate ?? new Date();
        const membershipId = await prisma.membership.findFirst({
            where: {
                userId: memberId,
                organizationId: orgId,
            },
            select: {
                id: true,
            },
        });
        const movement = await prisma.$transaction(async (tx) => {
            await assertSufficientStock(
                tx,
                orgId,
                input.catalogueId,
                input.fromLocationId,
                input.quantity,
            );

            const created = await tx.inventoryMovement.create({
                data: {
                    organizationId: orgId,
                    type: "ISSUE",
                    catalogueId: input.catalogueId,
                    quantity: input.quantity,
                    fromLocationId: input.fromLocationId,
                    unitCost: input.unitCost ?? null,
                    referenceType: input.referenceType ?? null,
                    referenceId: input.referenceId ?? null,
                    remarks: input.remarks ?? null,
                    movementDate,
                    createdByMemberId: membershipId?.id ?? null,
                },
                select: movementSelect,
            });

            await upsertStock(
                tx,
                orgId,
                input.catalogueId,
                input.fromLocationId,
                -input.quantity,
            );

            return created;
        });

        return mapMovement(movement);
    },

    async createTransfer(
        orgId: string,
        memberId: string,
        input: CreateTransferBody,
    ) {
        if (input.fromLocationId === input.toLocationId) {
            throw new ValidationError(
                "Source and destination locations must be different",
            );
        }

        await assertCatalogueInOrg(orgId, input.catalogueId);
        await assertLocationInOrg(orgId, input.fromLocationId);
        await assertLocationInOrg(orgId, input.toLocationId);

        const movementDate = input.movementDate ?? new Date();
        const transferGroupId = crypto.randomUUID();
        const membershipId = await prisma.membership.findFirst({
            where: {
                userId: memberId,
                organizationId: orgId,
            },
            select: {
                id: true,
            },
        });
        const [outMovement] = await prisma.$transaction(async (tx) => {
            await assertSufficientStock(
                tx,
                orgId,
                input.catalogueId,
                input.fromLocationId,
                input.quantity,
            );

            const commonData = {
                organizationId: orgId,
                catalogueId: input.catalogueId,
                quantity: input.quantity,
                unitCost: input.unitCost ?? null,
                remarks: input.remarks ?? null,
                movementDate,
                transferGroupId,
                createdByMemberId: membershipId?.id ?? null,
            };

            const out = await tx.inventoryMovement.create({
                data: {
                    ...commonData,
                    type: "TRANSFER_OUT",
                    fromLocationId: input.fromLocationId,
                },
                select: movementSelect,
            });

            await tx.inventoryMovement.create({
                data: {
                    ...commonData,
                    type: "TRANSFER_IN",
                    toLocationId: input.toLocationId,
                },
                select: { id: true },
            });

            await upsertStock(
                tx,
                orgId,
                input.catalogueId,
                input.fromLocationId,
                -input.quantity,
            );
            await upsertStock(
                tx,
                orgId,
                input.catalogueId,
                input.toLocationId,
                input.quantity,
            );

            return [out];
        });

        return { ...mapMovement(outMovement), transferGroupId };
    },

    async createAdjustment(
        orgId: string,
        memberId: string | undefined,
        input: CreateAdjustmentBody,
    ) {
        await assertCatalogueInOrg(orgId, input.catalogueId);
        await assertLocationInOrg(orgId, input.locationId);

        const movementDate = input.movementDate ?? new Date();
        const type =
            input.adjustmentType === "ADD"
                ? "ADJUSTMENT_ADD"
                : "ADJUSTMENT_SUB";
        const delta =
            input.adjustmentType === "ADD" ? input.quantity : -input.quantity;

        const movement = await prisma.$transaction(async (tx) => {
            if (input.adjustmentType === "SUB") {
                await assertSufficientStock(
                    tx,
                    orgId,
                    input.catalogueId,
                    input.locationId,
                    input.quantity,
                );
            }

            const created = await tx.inventoryMovement.create({
                data: {
                    organizationId: orgId,
                    type,
                    catalogueId: input.catalogueId,
                    quantity: input.quantity,
                    fromLocationId:
                        input.adjustmentType === "SUB"
                            ? input.locationId
                            : null,
                    toLocationId:
                        input.adjustmentType === "ADD"
                            ? input.locationId
                            : null,
                    remarks: input.remarks ?? null,
                    movementDate,
                    createdByMemberId: memberId ?? null,
                },
                select: movementSelect,
            });

            await upsertStock(
                tx,
                orgId,
                input.catalogueId,
                input.locationId,
                delta,
            );

            return created;
        });

        return mapMovement(movement);
    },
};

// ─── helpers ────────────────────────────────────────────────────────────────

async function assertCatalogueInOrg(orgId: string, catalogueId: string) {
    const item = await prisma.catalogue.findFirst({
        where: { id: catalogueId, organizationId: orgId },
        select: { id: true },
    });
    if (!item)
        throw new MissingError("Catalogue item not found in your organization");
}

async function assertLocationInOrg(orgId: string, locationId: string) {
    const loc = await prisma.inventoryLocation.findFirst({
        where: {
            id: locationId,
            organizationId: orgId,
            deletedAt: null,
            isActive: true,
        },
        select: { id: true },
    });
    if (!loc)
        throw new MissingError(
            `Inventory location not found or inactive: ${locationId}`,
        );
}

async function assertSupplierQuoteInOrg(
    orgId: string,
    supplierQuoteId: string,
) {
    const quote = await prisma.supplierQuote.findFirst({
        where: { id: supplierQuoteId, catalogue: { organizationId: orgId } },
        select: { id: true },
    });
    if (!quote)
        throw new MissingError("Supplier quote not found in your organization");
}

type TxClient = Omit<
    typeof prisma,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

async function assertSufficientStock(
    tx: TxClient,
    orgId: string,
    catalogueId: string,
    locationId: string,
    requiredQty: number,
) {
    const stock = await tx.inventoryStock.findFirst({
        where: { catalogueId, locationId, organizationId: orgId },
        select: { quantity: true },
    });

    const available = stock ? Number(stock.quantity) : 0;
    if (available < requiredQty) {
        throw new ConflictError(
            `Insufficient stock: available ${available}, required ${requiredQty}`,
        );
    }
}

async function upsertStock(
    tx: TxClient,
    orgId: string,
    catalogueId: string,
    locationId: string,
    delta: number,
) {
    const existing = await tx.inventoryStock.findFirst({
        where: { catalogueId, locationId, organizationId: orgId },
        select: { id: true, quantity: true },
    });

    if (existing) {
        await tx.inventoryStock.update({
            where: { id: existing.id },
            data: { quantity: { increment: delta } },
        });
    } else {
        await tx.inventoryStock.create({
            data: {
                organizationId: orgId,
                catalogueId,
                locationId,
                quantity: delta,
            },
        });
    }
}

export default inventoryMovementsService;
