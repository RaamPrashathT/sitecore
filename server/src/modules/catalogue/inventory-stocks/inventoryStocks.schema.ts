import { z } from "zod";

export const getInventoryStocksQuerySchema = z.object({
    index: z.coerce.number().int().min(0).default(0),
    size: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().default(""),
    locationId: z.string().optional(),
    catalogueId: z.string().optional(),
    locationType: z.enum(["WAREHOUSE", "PROJECT"]).optional(),
});
export type GetInventoryStocksQuery = z.infer<typeof getInventoryStocksQuerySchema>;

export const stockIdParamSchema = z.object({
    stockId: z.string().min(1, "stockId is required"),
});
export type StockIdParam = z.infer<typeof stockIdParamSchema>;

export const catalogueIdParamSchema = z.object({
    catalogueId: z.string().min(1, "catalogueId is required"),
});
export type CatalogueIdParam = z.infer<typeof catalogueIdParamSchema>;

export const getCatalogueStocksQuerySchema = z.object({
    index: z.coerce.number().int().min(0).default(0),
    size: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().default(""),
    locationType: z.enum(["WAREHOUSE", "PROJECT"]).optional(),
});
export type GetCatalogueStocksQuery = z.infer<typeof getCatalogueStocksQuerySchema>;
