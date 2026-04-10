import { z } from "zod";

const CatalogueCategoryEnum = z.enum(["MATERIALS", "LABOUR", "EQUIPMENT", "SUBCONTRACTORS", "TRANSPORT", "OVERHEAD"]);
const MeasurementUnitEnum = z.enum(["NOS", "BAG", "ROLL", "BUNDLE", "SET", "PAIR", "KG", "MT", "QUINTAL", "CUM", "CFT", "LITRE", "SQM", "SQFT", "RMT", "RFT", "DAY", "HOUR", "MONTH", "TRIP", "LS"]);

export const createCatalogueSchema = z.object({
    name: z.string().min(1, "Item name is required"),
    category: CatalogueCategoryEnum,
    unit: MeasurementUnitEnum,
    defaultLeadTime: z.number().int().nonnegative().optional(),

    supplier: z.object({
        id: z.uuid().optional(),
        name: z.string().min(1).optional(),
        truePrice: z.number().positive("True price must be greater than 0"),
        standardRate: z.number().positive("Standard rate must be greater than 0"),
        leadTimeDays: z.number().int().nonnegative().optional(),
    }).refine((data) => data.id || data.name, {
        message: "Either a Supplier ID or a New Supplier Name must be provided",
        path: ["name"],
    }),

    inventory: z.object({
        locationId: z.uuid().optional(),
        locationName: z.string().min(1).optional(),
        locationType: z.string().optional(),
        quantityOnHand: z.number().nonnegative(),
        averageUnitCost: z.number().nonnegative(),
    }).optional().refine((data) => {
        if (!data) return true;
        if (data.locationId) return true;
        return !!(data.locationName && data.locationType);
    }, {
        message: "New locations require both a Name and a Type (SITE/WAREHOUSE)",
        path: ["locationName"],
    }),
});

export const updateCatalogueSchema = z
    .object({
        name: z.string().min(1, "Item name is required").optional(),
        category: CatalogueCategoryEnum.optional(),
        unit: MeasurementUnitEnum.optional(),
        defaultLeadTime: z.number().int().nonnegative().optional(),

        supplier: z
            .object({
                truePrice: z.number().positive("True price must be greater than 0").optional(),
                standardRate: z.number().positive("Standard rate must be greater than 0").optional(),
                leadTimeDays: z.number().int().nonnegative().optional(),
            })
            .optional()
            .refine((data) => {
                if (!data) return true;
                return Object.values(data).some((value) => value !== undefined);
            }, {
                message: "At least one supplier field must be provided",
            }),

        inventory: z
            .object({
                quantityOnHand: z.number().nonnegative().optional(),
                averageUnitCost: z.number().nonnegative().optional(),
            })
            .optional()
            .refine((data) => {
                if (!data) return true;
                return Object.values(data).some((value) => value !== undefined);
            }, {
                message: "At least one inventory field must be provided",
            }),
    })
    .refine((data) => {
        return Object.values(data).some((value) => value !== undefined);
    }, {
        message: "At least one field must be provided for update",
    });

export const deleteCatalogueSchema = z.object({
    id: z.uuid("Invalid catalogue ID"),
});

export const createQuoteSchema = z.object({
    supplierId: z.uuid("Invalid supplier ID"),
    truePrice: z.number().positive("True price must be greater than 0"),
    standardRate: z.number().positive("Standard rate must be greater than 0"),
    leadTimeDays: z.number().int().nonnegative().optional(),
});

export const updateQuoteSchema = z
    .object({
        truePrice: z.number().positive("True price must be greater than 0").optional(),
        standardRate: z.number().positive("Standard rate must be greater than 0").optional(),
        leadTimeDays: z.number().int().nonnegative().optional(),
        validUntil: z.string().datetime().nullable().optional(),
    })
    .refine((data) => Object.values(data).some((value) => value !== undefined), {
        message: "At least one field must be provided for update",
    });

export const catalogueAndQuoteParamsSchema = z.object({
    id: z.uuid("Invalid catalogue ID"),
    quoteId: z.uuid("Invalid quote ID"),
});

export const catalogueAndInventoryParamsSchema = z.object({
    id: z.uuid("Invalid catalogue ID"),
    inventoryId: z.uuid("Invalid inventory ID"),
});

export const addInventorySchema = z.object({
    locationId: z.uuid().optional(),
    locationName: z.string().min(1).optional(),
    locationType: z.string().optional(),
    quantityOnHand: z.number().nonnegative(),
    averageUnitCost: z.number().nonnegative(),
}).refine((data) => {
    if (data.locationId) return true;
    return !!(data.locationName && data.locationType);
}, {
    message: "Either select a location or create a new one with Name and Type",
    path: ["locationName"],
});

export const updateInventorySchema = z
    .object({
        quantityOnHand: z.number().nonnegative().optional(),
        averageUnitCost: z.number().nonnegative().optional(),
    })
    .refine((data) => Object.values(data).some((value) => value !== undefined), {
        message: "At least one field must be provided for update",
    });

export interface CreateCataloguePayload {
    name: string;
    category: z.infer<typeof CatalogueCategoryEnum>;
    unit: z.infer<typeof MeasurementUnitEnum>;
    defaultLeadTime?: number | undefined;

    supplier: {
        id?: string | undefined;
        name?: string | undefined;
        truePrice: number;
        standardRate: number;
        leadTimeDays?: number | undefined;
    };

    inventory?: {
        locationId?: string | undefined;
        locationName?: string | undefined;
        locationType?: string | undefined;
        quantityOnHand: number;
        averageUnitCost: number;
    } | undefined;
}

export interface UpdateCataloguePayload {
    name?: string | undefined;
    category?: z.infer<typeof CatalogueCategoryEnum> | undefined;
    unit?: z.infer<typeof MeasurementUnitEnum> | undefined;
    defaultLeadTime?: number | undefined;
    supplier?:
        | {
              truePrice?: number | undefined;
              standardRate?: number | undefined;
              leadTimeDays?: number | undefined;
          }
        | undefined;
    inventory?:
        | {
              quantityOnHand?: number | undefined;
              averageUnitCost?: number | undefined;
          }
        | undefined;
}

export type CreateQuotePayload = z.infer<typeof createQuoteSchema>;
export type UpdateQuotePayload = z.infer<typeof updateQuoteSchema>;
export type AddInventoryPayload = z.infer<typeof addInventorySchema>;
export type UpdateInventoryPayload = z.infer<typeof updateInventorySchema>;