import z from "zod";

export const requisitionItemSchema = z.object({
    catalogueId: z.uuid("Invalid Catalogue ID"),
    quantity: z.coerce.number().min(0.01, "Quantity must be greater than zero"),
    estimatedUnitCost: z.coerce.number().min(0, "Cost cannot be negative"),
    assignedSupplierId: z.uuid("Invalid Supplier ID").optional(),
});

export const createRequisitionSchema = z.object({
    items: z.array(requisitionItemSchema).min(1, "A requisition must contain at least one item"),
});

export const phaseIdParamSchema = z.object({
    phaseId: z.uuid("Invalid Phase ID"),
});

export const requisitionIdParamSchema = z.object({
    requisitionId: z.uuid("Invalid Requisition ID"),
});