import { z } from "zod";

export const getSupplierQuotesQuerySchema = z.object({
    index: z.coerce.number().int().min(0).default(0),
    size: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().default(""),
    catalogueId: z.string().optional(),
    supplierId: z.string().optional(),
});
export type GetSupplierQuotesQuery = z.infer<typeof getSupplierQuotesQuerySchema>;

export const quoteIdParamSchema = z.object({
    quoteId: z.string().min(1, "quoteId is required"),
});
export type QuoteIdParam = z.infer<typeof quoteIdParamSchema>;

export const catalogueIdParamSchema = z.object({
    catalogueId: z.string().min(1, "catalogueId is required"),
});

export const supplierIdParamSchema = z.object({
    supplierId: z.string().min(1, "supplierId is required"),
});

export const createSupplierQuoteBodySchema = z.object({
    catalogueId: z.string().min(1, "catalogueId is required"),
    supplierId: z.string().min(1, "supplierId is required"),
    truePrice: z.number().positive("truePrice must be positive"),
    standardRate: z.number().positive("standardRate must be positive"),
    inventory: z.number().int().min(0, "inventory must be non-negative"),
    leadTime: z.number().int().min(0).optional(),
});
export type CreateSupplierQuoteBody = z.infer<typeof createSupplierQuoteBodySchema>;

export const editSupplierQuoteBodySchema = z.object({
    truePrice: z.number().positive().optional(),
    standardRate: z.number().positive().optional(),
    inventory: z.number().int().min(0).optional(),
    leadTime: z.number().int().min(0).optional().nullable(),
    changeReason: z.string().optional().nullable(),
});
export type EditSupplierQuoteBody = z.infer<typeof editSupplierQuoteBodySchema>;
