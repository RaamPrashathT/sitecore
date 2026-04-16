import { z } from "zod";

export const getCatalogueQuerySchema = z.object({
    index: z.coerce.number().int().min(0).default(0),
    size: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().default(""),
});
export type GetCatalogueQuery = z.infer<typeof getCatalogueQuerySchema>;

export const catalogueIdParamSchema = z.object({
    catalogueId: z.string().min(1, "catalogueId is required"),
});
export type CatalogueIdParam = z.infer<typeof catalogueIdParamSchema>;

const catalogueCategorySchema = z.enum([
    "MATERIALS",
    "LABOUR",
    "EQUIPMENT",
    "SUBCONTRACTORS",
    "TRANSPORT",
    "OVERHEAD",
]);

export const createCatalogueBodySchema = z.object({
    name: z.string().min(1, "name is required"),
    category: catalogueCategorySchema,
    unit: z.enum([
        "NOS", "BAG", "ROLL", "BUNDLE", "SET", "PAIR",
        "KG", "MT", "QUINTAL",
        "CUM", "CFT", "LITRE", "SQM", "SQFT", "RMT", "RFT",
        "DAY", "HOUR", "MONTH", "TRIP", "LS",
    ]),
    defaultLeadTime: z.number().int().min(0).default(0),
});
export type CreateCatalogueBody = z.infer<typeof createCatalogueBodySchema>;

export const editCatalogueBodySchema = createCatalogueBodySchema.partial();
export type EditCatalogueBody = z.infer<typeof editCatalogueBodySchema>;
