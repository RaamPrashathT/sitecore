import { z } from "zod";

export const getSuppliersQuerySchema = z.object({
    index: z.coerce.number().int().min(0).default(0),
    size: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().default(""),
    includeDeleted: z
        .union([z.literal("true"), z.literal("false"), z.boolean()])
        .transform((v) => v === true || v === "true")
        .default(false),
});
export type GetSuppliersQuery = z.infer<typeof getSuppliersQuerySchema>;

export const supplierIdParamSchema = z.object({
    supplierId: z.string().min(1, "supplierId is required"),
});
export type SupplierIdParam = z.infer<typeof supplierIdParamSchema>;

export const createSupplierBodySchema = z.object({
    name: z.string().min(1, "name is required"),
    email: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    contactPerson: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
});
export type CreateSupplierBody = z.infer<typeof createSupplierBodySchema>;

export const editSupplierBodySchema = createSupplierBodySchema.partial();
export type EditSupplierBody = z.infer<typeof editSupplierBodySchema>;
