import { MissingError } from "../../shared/error/missing.error.js";
import { ValidationError } from "../../shared/error/validation.error.js";
import { prisma } from "../../shared/lib/prisma.js";
import type { MeasurementUnit } from "../../../generated/prisma/index.js";
import type {
    createCatalogueFormSchema,
    deleteCatalogueFormSchema,
    editCatalogueFormSchema,
    CreateSupplierInput,
    EditSupplierInput,
    DeleteSupplierInput,
    CreateSupplierQuoteInput,
    EditSupplierQuoteInput,
    DeleteSupplierQuoteInput,
    CreateInventoryLocationInput,
    EditInventoryLocationInput,
    DeleteInventoryLocationInput,
    ReceiveMaterialInput,
    ConsumeMaterialInput,
    AdjustMaterialInput,
    GetInventoryTransactionsInput,
} from "./catalogue.schema.js";

const catalogueService = {
    // ─── Catalogue ────────────────────────────────────────────────────────────

    async getCatalogue(
        orgId: string,
        pageIndex: number,
        pageSize: number,
        searchQuery: string,
    ) {
        const skip = pageIndex * pageSize;
        const whereClause: {
            organizationId: string;
            OR?: Array<Record<string, unknown>>;
        } = { organizationId: orgId };

        if (searchQuery) {
            whereClause.OR = [
                { name: { contains: searchQuery, mode: "insensitive" } },
            ];
        }

        const [data, count] = await Promise.all([
            prisma.catalogue.findMany({
                where: whereClause,
                include: { supplierQuotes: { include: { supplier: true } } },
                take: pageSize,
                skip,
                orderBy: { name: "asc" },
            }),
            prisma.catalogue.count({ where: whereClause }),
        ]);

        return { data, count };
    },

    async getCatalogueById(catalogueId: string, organizationId: string) {
        const catalogue = await prisma.catalogue.findUnique({
            where: { id: catalogueId, organizationId },
            include: { supplierQuotes: { include: { supplier: true } } },
        });
        return catalogue;
    },

    async createCatalogue(data: createCatalogueFormSchema, orgId: string) {
        const existing = await prisma.catalogue.findUnique({
            where: { name_organizationId: { name: data.name, organizationId: orgId } },
        });
        if (existing) {
            throw new ValidationError("A catalogue item with this name already exists");
        }
        return prisma.catalogue.create({
            data: {
                name: data.name,
                category: data.category,
                unit: data.unit as MeasurementUnit,
                organizationId: orgId,
            },
        });
    },

    async editCatalogue(data: editCatalogueFormSchema, orgId: string) {
        const existing = await prisma.catalogue.findFirst({
            where: { id: data.catalogueId, organizationId: orgId },
        });
        if (!existing) throw new MissingError("Catalogue not found");

        if (data.name !== existing.name) {
            const conflict = await prisma.catalogue.findUnique({
                where: { name_organizationId: { name: data.name, organizationId: orgId } },
            });
            if (conflict) throw new ValidationError("A catalogue item with this name already exists");
        }

        return prisma.catalogue.update({
            where: { id: data.catalogueId },
            data: {
                name: data.name,
                category: data.category,
                unit: data.unit as MeasurementUnit,
            },
        });
    },

    async deleteCatalogue(data: deleteCatalogueFormSchema, orgId: string) {
        const existing = await prisma.catalogue.findFirst({
            where: { id: data.catalogueId, organizationId: orgId },
        });
        if (!existing) throw new MissingError("Catalogue not found");

        await prisma.catalogue.delete({ where: { id: data.catalogueId } });
    },

    // ─── Suppliers ────────────────────────────────────────────────────────────

    async getSuppliers(orgId: string) {
        return prisma.supplier.findMany({
            where: { organizationId: orgId },
            include: { quotes: true },
            orderBy: { name: "asc" },
        });
    },

    async createSupplier(data: CreateSupplierInput, orgId: string) {
        const existing = await prisma.supplier.findUnique({
            where: { name_organizationId: { name: data.name, organizationId: orgId } },
        });
        if (existing) throw new ValidationError("A supplier with this name already exists");

        return prisma.supplier.create({
            data: {
                name: data.name,
                contactName: data.contactName ?? null,
                email: data.email ?? null,
                phone: data.phone ?? null,
                organizationId: orgId,
            },
        });
    },

    async editSupplier(data: EditSupplierInput, orgId: string) {
        const existing = await prisma.supplier.findFirst({
            where: { id: data.supplierId, organizationId: orgId },
        });
        if (!existing) throw new MissingError("Supplier not found");

        const { supplierId, ...updateData } = data;
        return prisma.supplier.update({
            where: { id: supplierId },
            data: {
                ...(updateData.name !== undefined && { name: updateData.name }),
                ...(updateData.contactName !== undefined && { contactName: updateData.contactName ?? null }),
                ...(updateData.email !== undefined && { email: updateData.email ?? null }),
                ...(updateData.phone !== undefined && { phone: updateData.phone ?? null }),
            },
        });
    },

    async deleteSupplier(data: DeleteSupplierInput, orgId: string) {
        const existing = await prisma.supplier.findFirst({
            where: { id: data.supplierId, organizationId: orgId },
        });
        if (!existing) throw new MissingError("Supplier not found");

        await prisma.supplier.delete({ where: { id: data.supplierId } });
    },

    // ─── Supplier Quotes ──────────────────────────────────────────────────────

    async getQuotesByCatalogue(catalogueId: string, orgId: string) {
        const catalogue = await prisma.catalogue.findFirst({
            where: { id: catalogueId, organizationId: orgId },
        });
        if (!catalogue) throw new MissingError("Catalogue not found");

        return prisma.supplierQuote.findMany({
            where: { catalogueId },
            include: { supplier: true },
        });
    },

    async createSupplierQuote(data: CreateSupplierQuoteInput, orgId: string) {
        const [catalogue, supplier] = await Promise.all([
            prisma.catalogue.findFirst({ where: { id: data.catalogueId, organizationId: orgId } }),
            prisma.supplier.findFirst({ where: { id: data.supplierId, organizationId: orgId } }),
        ]);
        if (!catalogue) throw new MissingError("Catalogue not found");
        if (!supplier) throw new MissingError("Supplier not found");

        const existing = await prisma.supplierQuote.findUnique({
            where: { catalogueId_supplierId: { catalogueId: data.catalogueId, supplierId: data.supplierId } },
        });
        if (existing) throw new ValidationError("A quote from this supplier already exists for this catalogue item");

        return prisma.supplierQuote.create({
            data: {
                catalogueId: data.catalogueId,
                supplierId: data.supplierId,
                truePrice: data.truePrice,
                standardRate: data.standardRate,
                leadTimeDays: data.leadTimeDays ?? null,
                validUntil: data.validUntil ? new Date(data.validUntil) : null,
            },
        });
    },

    async editSupplierQuote(data: EditSupplierQuoteInput, orgId: string) {
        const quote = await prisma.supplierQuote.findFirst({
            where: { id: data.quoteId, catalogue: { organizationId: orgId } },
        });
        if (!quote) throw new MissingError("Supplier quote not found");

        const { quoteId, ...updateData } = data;
        return prisma.supplierQuote.update({
            where: { id: quoteId },
            data: {
                ...(updateData.truePrice !== undefined && { truePrice: updateData.truePrice }),
                ...(updateData.standardRate !== undefined && { standardRate: updateData.standardRate }),
                ...(updateData.leadTimeDays !== undefined && { leadTimeDays: updateData.leadTimeDays ?? null }),
                ...(updateData.validUntil !== undefined && { validUntil: updateData.validUntil ? new Date(updateData.validUntil) : null }),
            },
        });
    },

    async deleteSupplierQuote(data: DeleteSupplierQuoteInput, orgId: string) {
        const quote = await prisma.supplierQuote.findFirst({
            where: { id: data.quoteId, catalogue: { organizationId: orgId } },
        });
        if (!quote) throw new MissingError("Supplier quote not found");

        await prisma.supplierQuote.delete({ where: { id: data.quoteId } });
    },

    // ─── Inventory Locations ──────────────────────────────────────────────────

    async getInventoryLocations(orgId: string) {
        return prisma.inventoryLocation.findMany({
            where: { organizationId: orgId },
            include: { items: true },
            orderBy: { name: "asc" },
        });
    },

    async createInventoryLocation(data: CreateInventoryLocationInput, orgId: string) {
        const existing = await prisma.inventoryLocation.findUnique({
            where: { name_organizationId: { name: data.name, organizationId: orgId } },
        });
        if (existing) throw new ValidationError("A location with this name already exists");

        return prisma.inventoryLocation.create({
            data: { ...data, organizationId: orgId },
        });
    },

    async editInventoryLocation(data: EditInventoryLocationInput, orgId: string) {
        const existing = await prisma.inventoryLocation.findFirst({
            where: { id: data.locationId, organizationId: orgId },
        });
        if (!existing) throw new MissingError("Inventory location not found");

        const { locationId, ...updateData } = data;
        return prisma.inventoryLocation.update({
            where: { id: locationId },
            data: {
                ...(updateData.name !== undefined && { name: updateData.name }),
                ...(updateData.type !== undefined && { type: updateData.type }),
            },
        });
    },

    async deleteInventoryLocation(data: DeleteInventoryLocationInput, orgId: string) {
        const existing = await prisma.inventoryLocation.findFirst({
            where: { id: data.locationId, organizationId: orgId },
        });
        if (!existing) throw new MissingError("Inventory location not found");

        await prisma.inventoryLocation.delete({ where: { id: data.locationId } });
    },

    // ─── Inventory Ledger ─────────────────────────────────────────────────────

    async getInventoryBalances(orgId: string) {
        return prisma.inventoryItem.findMany({
            where: { location: { organizationId: orgId } },
            include: {
                catalogue: true,
                location: true,
            },
            orderBy: { catalogue: { name: "asc" } },
        });
    },

    async receiveMaterial(data: ReceiveMaterialInput, orgId: string, membershipId: string) {
        const [catalogue, location] = await Promise.all([
            prisma.catalogue.findFirst({ where: { id: data.catalogueId, organizationId: orgId } }),
            prisma.inventoryLocation.findFirst({ where: { id: data.locationId, organizationId: orgId } }),
        ]);
        if (!catalogue) throw new MissingError("Catalogue item not found");
        if (!location) throw new MissingError("Inventory location not found");

        return prisma.$transaction(async (tx) => {
            const item = await tx.inventoryItem.upsert({
                where: { locationId_catalogueId: { locationId: data.locationId, catalogueId: data.catalogueId } },
                create: {
                    locationId: data.locationId,
                    catalogueId: data.catalogueId,
                    quantityOnHand: data.quantity,
                    averageUnitCost: data.unitCost ?? 0,
                },
                update: {
                    quantityOnHand: { increment: data.quantity },
                },
            });

            await tx.inventoryTransaction.create({
                data: {
                    inventoryItemId: item.id,
                    quantityChange: data.quantity,
                    type: "RECEIVED",
                    notes: data.notes ?? null,
                    recordedById: membershipId,
                },
            });

            return item;
        });
    },

    async consumeMaterial(data: ConsumeMaterialInput, orgId: string, membershipId: string) {
        const item = await prisma.inventoryItem.findUnique({
            where: { locationId_catalogueId: { locationId: data.locationId, catalogueId: data.catalogueId } },
            include: { location: true },
        });
        if (!item || item.location.organizationId !== orgId) throw new MissingError("Inventory item not found");
        if (Number(item.quantityOnHand) < data.quantity) {
            throw new ValidationError("Insufficient stock for this operation");
        }

        const phase = await prisma.phase.findFirst({
            where: { id: data.phaseId, project: { organizationId: orgId } },
        });
        if (!phase) throw new MissingError("Phase not found");

        return prisma.$transaction(async (tx) => {
            const updated = await tx.inventoryItem.update({
                where: { id: item.id },
                data: { quantityOnHand: { decrement: data.quantity } },
            });

            await tx.inventoryTransaction.create({
                data: {
                    inventoryItemId: item.id,
                    quantityChange: -data.quantity,
                    type: "CONSUMED",
                    phaseId: data.phaseId,
                    notes: data.notes ?? null,
                    recordedById: membershipId,
                },
            });

            return updated;
        });
    },

    async adjustMaterial(data: AdjustMaterialInput, orgId: string, membershipId: string) {
        const item = await prisma.inventoryItem.findUnique({
            where: { locationId_catalogueId: { locationId: data.locationId, catalogueId: data.catalogueId } },
            include: { location: true },
        });
        if (!item || item.location.organizationId !== orgId) throw new MissingError("Inventory item not found");

        const newQty = Number(item.quantityOnHand) + data.quantity;
        if (newQty < 0) throw new ValidationError("Adjustment would result in negative stock");

        return prisma.$transaction(async (tx) => {
            const updated = await tx.inventoryItem.update({
                where: { id: item.id },
                data: { quantityOnHand: { increment: data.quantity } },
            });

            await tx.inventoryTransaction.create({
                data: {
                    inventoryItemId: item.id,
                    quantityChange: data.quantity,
                    type: "ADJUSTED",
                    notes: data.notes,
                    recordedById: membershipId,
                },
            });

            return updated;
        });
    },

    async getInventoryTransactions(input: GetInventoryTransactionsInput, orgId: string) {
        const skip = input.pageIndex * input.pageSize;
        const where: Record<string, unknown> = {
            inventoryItem: { location: { organizationId: orgId } },
        };

        if (input.catalogueId) {
            (where.inventoryItem as Record<string, unknown>) = {
                ...(where.inventoryItem as Record<string, unknown>),
                catalogueId: input.catalogueId,
            };
        }
        if (input.locationId) {
            (where.inventoryItem as Record<string, unknown>) = {
                ...(where.inventoryItem as Record<string, unknown>),
                locationId: input.locationId,
            };
        }

        const [data, count] = await Promise.all([
            prisma.inventoryTransaction.findMany({
                where,
                include: {
                    inventoryItem: { include: { catalogue: true, location: true } },
                    recordedBy: true,
                    phase: true,
                },
                orderBy: { createdAt: "desc" },
                take: input.pageSize,
                skip,
            }),
            prisma.inventoryTransaction.count({ where }),
        ]);

        return { data, count };
    },
};

export default catalogueService;
