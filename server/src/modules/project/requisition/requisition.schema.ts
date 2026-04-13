import z from "zod";

export const requisitionItemSchema = z.object({
    catalogueId: z.string().uuid("Invalid Catalogue ID"),
    lineItemId: z.string().uuid("Invalid Line Item ID"), 
    quantity: z.coerce.number().min(0.01, "Quantity must be greater than zero"),
    estimatedUnitCost: z.coerce.number().min(0, "Cost cannot be negative"),
    assignedSupplierId: z.string().uuid("Invalid Supplier ID").optional(),
});

export const getPaymentPendingSchema = z.object({
    organizationId: z.string().length(36),
    pageIndex: z.number().min(0),
    pageSize: z.number().min(1),
    searchQuery: z.string().max(500),
});

export const createRequisitionSchema = z.object({
    title: z.string().min(1, "Requisition title is required"),
    items: z.array(requisitionItemSchema).min(1, "A requisition must contain at least one item"),
});

export const orderRequisitionItemSchema = z.object({
    actualUnitCost: z.coerce.number().min(0),
    billedUnitRate: z.coerce.number().min(0),
});

export const requisitionSlugParamSchema = z.object({
    phaseSlug: z.string().min(1, "Phase slug is required"),
    requisitionSlug: z.string().min(1, "Requisition slug is required"),
});

export const phaseIdParamSchema = z.object({
    phaseId: z.string().uuid("Invalid Phase ID"),
});

export const requisitionIdParamSchema = z.object({
    requisitionId: z.string().uuid("Invalid Requisition ID"),
});

export const requisitionItemIdParamSchema = z.object({
    itemId: z.string().uuid("Invalid Item ID"),
});