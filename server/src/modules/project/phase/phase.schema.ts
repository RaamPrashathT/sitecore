import z from "zod";

export const phaseLineItemSchema = z.object({
    name: z.string().min(1, "Line item name is required"),
    category: z.enum([
        "MATERIALS",
        "LABOUR",
        "EQUIPMENT",
        "SUBCONTRACTORS",
        "TRANSPORT",
        "OVERHEAD",
    ]),
    estimatedCost: z.coerce.number().min(0, "Cost cannot be negative"),
    billedValue: z.coerce.number().min(0, "Billed value cannot be negative"),
});

export const createPhaseSchema = z.object({
    name: z.string().min(1, "Phase name is required"),
    description: z.string().optional(),
    
    startDate: z.coerce.date(),
    paymentDeadline: z.coerce.date(),
    
    prevOrder: z.coerce.number().optional(),
    nextOrder: z.coerce.number().optional(),

    // The new Schedule of Values
    lineItems: z.array(phaseLineItemSchema).min(1, "A phase must have at least one line item in its Schedule of Values"),
});

export const updatePhaseSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    startDate: z.coerce.date().optional(),
    paymentDeadline: z.coerce.date().optional(),
});

export const phaseIdParamSchema = z.object({
    phaseId: z.uuid("Invalid Phase ID"),
});

export const phaseSlugParamSchema = z.object({
    phaseSlug: z.string().min(1, "Phase slug is required"),
});