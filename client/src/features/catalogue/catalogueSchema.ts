import { z } from "zod";

export const CatalogueCategoryEnum = z.enum([
    "MATERIALS",
    "LABOUR",
    "EQUIPMENT",
    "SUBCONTRACTORS",
    "TRANSPORT",
    "OVERHEAD",
]);

export const MeasurementUnitEnum = z.enum([
    "NOS",
    "BAG",
    "ROLL",
    "BUNDLE",
    "SET",
    "PAIR",
    "KG",
    "MT",
    "QUINTAL",
    "CUM",
    "CFT",
    "LITRE",
    "SQM",
    "SQFT",
    "RMT",
    "RFT",
    "DAY",
    "HOUR",
    "MONTH",
    "TRIP",
    "LS",
]);

export const LocationTypeEnum = z.enum(["SITE", "WAREHOUSE"]);

export const createCatalogueSchema = z.object({
    name: z.string().min(1, "Item name is required"),
    category: CatalogueCategoryEnum,
    unit: MeasurementUnitEnum,
    defaultLeadTime: z.number().int().nonnegative().optional(),

    supplier: z
        .object({
            id: z.uuid().optional(),
            name: z.string().min(1).optional(),
            truePrice: z.number().positive("True price must be greater than 0"),
            standardRate: z
                .number()
                .positive("Standard rate must be greater than 0"),
            leadTimeDays: z.number().int().nonnegative().optional(),
        })
        .refine((data) => data.id || data.name, {
            message: "Either select a supplier or create a new one",
            path: ["name"],
        }),

    inventory: z
        .object({
            locationId: z.uuid().optional(),
            locationName: z.string().min(1).optional(),
            locationType: LocationTypeEnum.optional(),
            quantityOnHand: z.number().nonnegative(),
            averageUnitCost: z.number().nonnegative(),
        })
        .optional()
        .refine(
            (data) => {
                if (!data) return true;
                if (data.locationId) return true;
                return !!(data.locationName && data.locationType);
            },
            {
                message:
                    "New locations require both a Name and a Type (SITE/WAREHOUSE)",
                path: ["locationName"],
            },
        ),
});

export const updateCatalogueSchema = z
    .object({
        name: z.string().min(1, "Item name is required").optional(),
        category: CatalogueCategoryEnum.optional(),
        unit: MeasurementUnitEnum.optional(),
        defaultLeadTime: z.number().int().nonnegative().optional(),
    })
    .refine(
        (data) => Object.values(data).some((value) => value !== undefined),
        {
            message: "At least one field must be provided for update",
        },
    );

export const createQuoteSchema = z.object({
    supplierId: z.uuid("    Invalid supplier ID"),
    truePrice: z.number().positive("True price must be greater than 0"),
    standardRate: z.number().positive("Standard rate must be greater than 0"),
    leadTimeDays: z.number().int().nonnegative().optional(),
});

// Update Quote Schema
export const updateQuoteSchema = z
    .object({
        truePrice: z
            .number()
            .positive("True price must be greater than 0")
            .optional(),
        standardRate: z
            .number()
            .positive("Standard rate must be greater than 0")
            .optional(),
        leadTimeDays: z.number().int().nonnegative().optional(),
        validUntil: z.iso.datetime().nullable().optional(),
    })
    .refine(
        (data) => Object.values(data).some((value) => value !== undefined),
        {
            message: "At least one field must be provided for update",
        },
    );

export const updateInventorySchema = z
    .object({
        quantityOnHand: z.number().nonnegative().optional(),
        averageUnitCost: z.number().nonnegative().optional(),
    })
    .refine(
        (data) => Object.values(data).some((value) => value !== undefined),
        {
            message: "At least one field must be provided for update",
        },
    );

export const addInventorySchema = z.object({
    locationId: z.uuid().optional(),
    locationName: z.string().min(1).optional(),
    locationType: LocationTypeEnum.optional(),
    quantityOnHand: z.number().nonnegative(),
    averageUnitCost: z.number().nonnegative(),
}).refine(
    (data) => {
        if (data.locationId) return true;
        return !!(data.locationName && data.locationType);
    },
    {
        message: "Either select a location or create a new one with Name and Type",
        path: ["locationName"],
    },
);

export type CreateCatalogueInput = z.infer<typeof createCatalogueSchema>;
export type UpdateCatalogueInput = z.infer<typeof updateCatalogueSchema>;
export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;
export type UpdateQuoteInput = z.infer<typeof updateQuoteSchema>;
export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>;
export type AddInventoryInput = z.infer<typeof addInventorySchema>;
