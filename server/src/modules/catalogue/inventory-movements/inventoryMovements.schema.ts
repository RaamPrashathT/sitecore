import { z } from "zod";

export const getInventoryMovementsQuerySchema = z.object({
    index: z.coerce.number().int().min(0).default(0),
    size: z.coerce.number().int().min(1).max(1000).default(10),
    search: z.string().default(""),
    catalogueId: z.string().optional(),
    locationId: z.string().optional(),
    type: z
        .enum([
            "RECEIPT",
            "ISSUE",
            "TRANSFER_IN",
            "TRANSFER_OUT",
            "ADJUSTMENT_ADD",
            "ADJUSTMENT_SUB",
            "RETURN_IN",
            "RETURN_OUT",
        ])
        .optional(),
});
export type GetInventoryMovementsQuery = z.infer<typeof getInventoryMovementsQuerySchema>;

export const movementIdParamSchema = z.object({
    movementId: z.string().min(1, "movementId is required"),
});
export type MovementIdParam = z.infer<typeof movementIdParamSchema>;

export const createReceiptBodySchema = z.object({
    catalogueId: z.string().min(1, "catalogueId is required"),
    toLocationId: z.string().min(1, "toLocationId is required"),
    quantity: z.number().positive("quantity must be positive"),
    unitCost: z.number().positive().optional().nullable(),
    supplierQuoteId: z.string().optional().nullable(),
    referenceType: z.string().optional().nullable(),
    referenceId: z.string().optional().nullable(),
    remarks: z.string().optional().nullable(),
    movementDate: z.coerce.date().optional(),
});
export type CreateReceiptBody = z.infer<typeof createReceiptBodySchema>;

export const createIssueBodySchema = z.object({
    catalogueId: z.string().min(1, "catalogueId is required"),
    fromLocationId: z.string().min(1, "fromLocationId is required"),
    quantity: z.number().positive("quantity must be positive"),
    unitCost: z.number().positive().optional().nullable(),
    referenceType: z.string().optional().nullable(),
    referenceId: z.string().optional().nullable(),
    remarks: z.string().optional().nullable(),
    movementDate: z.coerce.date().optional(),
});
export type CreateIssueBody = z.infer<typeof createIssueBodySchema>;

export const createTransferBodySchema = z.object({
    catalogueId: z.string().min(1, "catalogueId is required"),
    fromLocationId: z.string().min(1, "fromLocationId is required"),
    toLocationId: z.string().min(1, "toLocationId is required"),
    quantity: z.number().positive("quantity must be positive"),
    unitCost: z.number().positive().optional().nullable(),
    remarks: z.string().optional().nullable(),
    movementDate: z.coerce.date().optional(),
});
export type CreateTransferBody = z.infer<typeof createTransferBodySchema>;

export const createAdjustmentBodySchema = z.object({
    catalogueId: z.string().min(1, "catalogueId is required"),
    locationId: z.string().min(1, "locationId is required"),
    quantity: z.number().positive("quantity must be positive"),
    adjustmentType: z.enum(["ADD", "SUB"]),
    remarks: z.string().optional().nullable(),
    movementDate: z.coerce.date().optional(),
});
export type CreateAdjustmentBody = z.infer<typeof createAdjustmentBodySchema>;
