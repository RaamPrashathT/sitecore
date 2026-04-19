import { z } from "zod";

const booleanLike = z
    .union([z.literal("true"), z.literal("false"), z.boolean()])
    .transform((v) => v === true || v === "true");

export const getInventoryLocationsQuerySchema = z.object({
    index: z.coerce.number().int().min(0).default(0),
    size: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().default(""),
    type: z.enum(["WAREHOUSE", "PROJECT"]).optional(),
    projectId: z.string().optional(),
    catalogueId: z.string().min(1, "catalogueId is required").optional(),
    includeDeleted: booleanLike.default(false),
    includeInactive: booleanLike.default(false),
});
export type GetInventoryLocationsQuery = z.infer<typeof getInventoryLocationsQuerySchema>;

export const locationIdParamSchema = z.object({
    locationId: z.string().min(1, "locationId is required"),
});
export type LocationIdParam = z.infer<typeof locationIdParamSchema>;

export const createInventoryLocationBodySchema = z.object({
    name: z.string().min(1, "name is required"),
    code: z.string().optional().nullable(),
    type: z.enum(["WAREHOUSE", "PROJECT"]),
    projectId: z.string().optional().nullable(),
    isActive: z.boolean().default(true),
});
export type CreateInventoryLocationBody = z.infer<typeof createInventoryLocationBodySchema>;

export const editInventoryLocationBodySchema = createInventoryLocationBodySchema.partial();
export type EditInventoryLocationBody = z.infer<typeof editInventoryLocationBodySchema>;

export const locationStocksQuerySchema = z.object({
    index: z.coerce.number().int().min(0).default(0),
    size: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().default(""),
});
export type LocationStocksQuery = z.infer<typeof locationStocksQuerySchema>;

const movementTypeEnum = z.enum([
    "RECEIPT",
    "ISSUE",
    "TRANSFER_IN",
    "TRANSFER_OUT",
    "ADJUSTMENT_ADD",
    "ADJUSTMENT_SUB",
    "RETURN_IN",
    "RETURN_OUT",
]);

export const locationMovementsQuerySchema = z.object({
    index: z.coerce.number().int().min(0).default(0),
    size: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().default(""),
    type: movementTypeEnum.optional(),
});
export type LocationMovementsQuery = z.infer<typeof locationMovementsQuerySchema>;
