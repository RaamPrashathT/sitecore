import { Prisma } from "../../../../generated/prisma/index.js";
import { prisma } from "../../../shared/lib/prisma.js";
import { ConflictError } from "../../../shared/error/conflict.error.js";
import { MissingError } from "../../../shared/error/missing.error.js";
import type { CreateSupplierQuoteBody, EditSupplierQuoteBody } from "./supplierQuotes.schema.js";

const supplierQuotesService = {
    async getSupplierQuotes(
        orgId: string,
        pageIndex: number,
        pageSize: number,
        catalogueId?: string,
        supplierId?: string,
    ) {
        const skip = pageIndex * pageSize;

        const where: Prisma.SupplierQuoteWhereInput = {
            catalogue: { organizationId: orgId },
            ...(catalogueId && { catalogueId }),
            ...(supplierId && { supplierId }),
        };

        const [quotes, count] = await Promise.all([
            prisma.supplierQuote.findMany({
                where,
                skip,
                take: pageSize,
                select: {
                    id: true,
                    truePrice: true,
                    standardRate: true,
                    leadTime: true,
                    inventory: true,
                    supplierId: true,
                    catalogueId: true,
                    createdAt: true,
                    updatedAt: true,
                    supplier: { select: { id: true, name: true } },
                    catalogue: { select: { id: true, name: true, unit: true, category: true } },
                },
                orderBy: { createdAt: "desc" },
            }),
            prisma.supplierQuote.count({ where }),
        ]);

        const data = quotes.map((q) => ({
            ...q,
            truePrice: Number(q.truePrice),
            standardRate: Number(q.standardRate),
        }));

        return { data, count };
    },

    async getSupplierQuoteById(orgId: string, quoteId: string) {
        const quote = await prisma.supplierQuote.findFirst({
            where: {
                id: quoteId,
                catalogue: { organizationId: orgId },
            },
            select: {
                id: true,
                truePrice: true,
                standardRate: true,
                leadTime: true,
                inventory: true,
                supplierId: true,
                catalogueId: true,
                createdAt: true,
                updatedAt: true,
                supplier: { select: { id: true, name: true } },
                catalogue: { select: { id: true, name: true, unit: true, category: true } },
            },
        });

        if (!quote) throw new MissingError("Supplier quote not found");

        return {
            ...quote,
            truePrice: Number(quote.truePrice),
            standardRate: Number(quote.standardRate),
        };
    },

    async createSupplierQuote(orgId: string, input: CreateSupplierQuoteBody) {
        const catalogue = await prisma.catalogue.findFirst({
            where: { id: input.catalogueId, organizationId: orgId },
            select: { id: true },
        });
        if (!catalogue) throw new MissingError("Catalogue item not found in your organization");

        const supplier = await prisma.supplier.findFirst({
            where: { id: input.supplierId, organizationId: orgId, deletedAt: null },
            select: { id: true },
        });
        if (!supplier) throw new MissingError("Supplier not found or has been archived");

        try {
            const quote = await prisma.supplierQuote.create({
                data: {
                    catalogueId: input.catalogueId,
                    supplierId: input.supplierId,
                    truePrice: input.truePrice,
                    standardRate: input.standardRate,
                    inventory: input.inventory,
                    leadTime: input.leadTime ?? null,
                },
                select: { id: true },
            });
            return quote;
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === "P2002"
            ) {
                throw new ConflictError(
                    "A supplier quote for this catalogue item and supplier already exists",
                );
            }
            throw error;
        }
    },

    async editSupplierQuote(
        orgId: string,
        quoteId: string,
        input: EditSupplierQuoteBody,
        changedByMemberId?: string,
    ) {
        const quote = await prisma.supplierQuote.findFirst({
            where: {
                id: quoteId,
                catalogue: { organizationId: orgId },
            },
            select: {
                id: true,
                truePrice: true,
                standardRate: true,
                leadTime: true,
                inventory: true,
            },
        });

        if (!quote) throw new MissingError("Supplier quote not found");

        const [, updated] = await prisma.$transaction([
            prisma.supplierQuoteHistory.create({
                data: {
                    supplierQuoteId: quote.id,
                    truePrice: quote.truePrice,
                    standardRate: quote.standardRate,
                    leadTime: quote.leadTime,
                    inventory: quote.inventory,
                    changeReason: input.changeReason ?? null,
                    changedByMemberId: changedByMemberId ?? null,
                },
            }),
            prisma.supplierQuote.update({
                where: { id: quote.id },
                data: {
                    ...(input.truePrice !== undefined && { truePrice: input.truePrice }),
                    ...(input.standardRate !== undefined && { standardRate: input.standardRate }),
                    ...(input.inventory !== undefined && { inventory: input.inventory }),
                    ...(input.leadTime !== undefined && { leadTime: input.leadTime }),
                },
                select: { id: true },
            }),
        ]);

        return updated;
    },

    async deleteSupplierQuote(orgId: string, quoteId: string) {
        const quote = await prisma.supplierQuote.findFirst({
            where: {
                id: quoteId,
                catalogue: { organizationId: orgId },
            },
            select: { id: true },
        });

        if (!quote) throw new MissingError("Supplier quote not found");

        const refCount = await prisma.requisitionItem.count({
            where: { assignedSupplierId: quoteId },
        });

        if (refCount > 0) {
            throw new ConflictError(
                "Cannot delete supplier quote: it is referenced by one or more requisition items",
            );
        }

        await prisma.supplierQuote.delete({ where: { id: quoteId } });
    },

    async getQuotesByCatalogueId(orgId: string, catalogueId: string) {
        const catalogue = await prisma.catalogue.findFirst({
            where: { id: catalogueId, organizationId: orgId },
            select: { id: true },
        });
        if (!catalogue) throw new MissingError("Catalogue item not found");

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

    async getQuotesBySupplierId(orgId: string, supplierId: string) {
        const supplier = await prisma.supplier.findFirst({
            where: { id: supplierId, organizationId: orgId },
            select: { id: true },
        });
        if (!supplier) throw new MissingError("Supplier not found");

        const quotes = await prisma.supplierQuote.findMany({
            where: { supplierId },
            select: {
                id: true,
                truePrice: true,
                standardRate: true,
                leadTime: true,
                inventory: true,
                catalogue: { select: { id: true, name: true, unit: true } },
            },
        });

        const data = quotes.map((q) => ({
            id: q.id,
            truePrice: Number(q.truePrice),
            standardRate: Number(q.standardRate),
            leadTime: q.leadTime,
            inventory: q.inventory,
            catalogue: q.catalogue,
        }));

        return { data, count: data.length };
    },
};

export default supplierQuotesService;
