import { Prisma } from "../../../../generated/prisma/index.js";
import { prisma } from "../../../shared/lib/prisma.js";
import { ConflictError } from "../../../shared/error/conflict.error.js";
import { MissingError } from "../../../shared/error/missing.error.js";
import type { CreateSupplierBody, EditSupplierBody } from "./suppliers.schema.js";

const suppliersService = {
    async getSuppliers(
        orgId: string,
        pageIndex: number,
        pageSize: number,
        search: string,
        includeDeleted: boolean,
    ) {
        const skip = pageIndex * pageSize;

        const where: Prisma.SupplierWhereInput = {
            organizationId: orgId,
            ...(!includeDeleted && { deletedAt: null }),
            ...(search.length > 0 && {
                name: { contains: search, mode: "insensitive" },
            }),
        };

        const [suppliers, count] = await Promise.all([
            prisma.supplier.findMany({
                where,
                skip,
                take: pageSize,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    contactPerson: true,
                    address: true,
                    deletedAt: true,
                    createdAt: true,
                    updatedAt: true,
                },
                orderBy: { createdAt: "desc" },
            }),
            prisma.supplier.count({ where }),
        ]);

        return { data: suppliers, count };
    },

    async getSupplierById(orgId: string, supplierId: string) {
        const supplier = await prisma.supplier.findFirst({
            where: { id: supplierId, organizationId: orgId },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                contactPerson: true,
                address: true,
                deletedAt: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!supplier) throw new MissingError("Supplier not found");
        return supplier;
    },

    async createSupplier(orgId: string, input: CreateSupplierBody) {
        try {
            const supplier = await prisma.supplier.create({
                data: {
                    name: input.name,
                    email: input.email ?? null,
                    phone: input.phone ?? null,
                    contactPerson: input.contactPerson ?? null,
                    address: input.address ?? null,
                    organizationId: orgId,
                },
                select: { id: true },
            });
            return supplier;
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === "P2002"
            ) {
                throw new ConflictError(
                    "A supplier with this name already exists in your organization",
                );
            }
            throw error;
        }
    },

    async editSupplier(orgId: string, supplierId: string, input: EditSupplierBody) {
        const existing = await prisma.supplier.findFirst({
            where: { id: supplierId, organizationId: orgId, deletedAt: null },
            select: { id: true },
        });

        if (!existing) throw new MissingError("Supplier not found or has been archived");

        try {
            const updated = await prisma.supplier.update({
                where: { id: supplierId },
                data: {
                    ...(input.name !== undefined && { name: input.name }),
                    ...(input.email !== undefined && { email: input.email }),
                    ...(input.phone !== undefined && { phone: input.phone }),
                    ...(input.contactPerson !== undefined && { contactPerson: input.contactPerson }),
                    ...(input.address !== undefined && { address: input.address }),
                },
                select: { id: true },
            });
            return updated;
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === "P2002"
            ) {
                throw new ConflictError(
                    "A supplier with this name already exists in your organization",
                );
            }
            throw error;
        }
    },

    async archiveSupplier(orgId: string, supplierId: string) {
        const existing = await prisma.supplier.findFirst({
            where: { id: supplierId, organizationId: orgId },
            select: { id: true, deletedAt: true },
        });

        if (!existing) throw new MissingError("Supplier not found");
        if (existing.deletedAt !== null) {
            throw new ConflictError("Supplier is already archived");
        }

        await prisma.supplier.update({
            where: { id: supplierId },
            data: { deletedAt: new Date() },
        });
    },

    async restoreSupplier(orgId: string, supplierId: string) {
        const existing = await prisma.supplier.findFirst({
            where: { id: supplierId, organizationId: orgId },
            select: { id: true, deletedAt: true },
        });

        if (!existing) throw new MissingError("Supplier not found");
        if (existing.deletedAt === null) {
            throw new ConflictError("Supplier is already active");
        }

        const restored = await prisma.supplier.update({
            where: { id: supplierId },
            data: { deletedAt: null },
            select: { id: true },
        });
        return restored;
    },

    async getQuotesBySupplierId(orgId: string, supplierId: string) {
        const existing = await prisma.supplier.findFirst({
            where: { id: supplierId, organizationId: orgId },
            select: { id: true },
        });

        if (!existing) throw new MissingError("Supplier not found");

        const quotes = await prisma.supplierQuote.findMany({
            where: { supplierId },
            select: {
                id: true,
                truePrice: true,
                standardRate: true,
                leadTime: true,
                inventory: true,
                catalogue: {
                    select: { id: true, name: true, unit: true },
                },
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

    async getCatalogueItemsBySupplierId(orgId: string, supplierId: string) {
        const existing = await prisma.supplier.findFirst({
            where: { id: supplierId, organizationId: orgId },
            select: { id: true },
        });

        if (!existing) throw new MissingError("Supplier not found");

        const quotes = await prisma.supplierQuote.findMany({
            where: { supplierId },
            select: {
                catalogue: {
                    select: { id: true, name: true, category: true, unit: true },
                },
            },
        });

        const seen = new Set<string>();
        const data = quotes
            .map((q) => q.catalogue)
            .filter((c) => {
                if (seen.has(c.id)) return false;
                seen.add(c.id);
                return true;
            });

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

export default suppliersService;
