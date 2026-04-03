import z from "zod";

export const requisitionItemSchema = z.object({
    catalogueId: z.uuid("Invalid Catalogue ID"),
    quantity: z.coerce.number().min(0.01, "Quantity must be greater than zero"),
    estimatedUnitCost: z.coerce.number().min(0, "Cost cannot be negative"),
    assignedSupplierId: z.uuid("Invalid Supplier ID").optional(),
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

export const requisitionSlugParamSchema = z.object({
    phaseSlug: z.string().min(1, "Phase slug is required"),
    requisitionSlug: z.string().min(1, "Requisition slug is required"),
});

export const phaseIdParamSchema = z.object({
    phaseId: z.uuid("Invalid Phase ID"),
});

export const requisitionIdParamSchema = z.object({
    requisitionId: z.uuid("Invalid Requisition ID"),
});