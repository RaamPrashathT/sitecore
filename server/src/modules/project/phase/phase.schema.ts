import z from "zod";

export const createPhaseSchema = z.object({
    name: z.string().min(1, "Phase name is required"),
    description: z.string().optional(),
    
    budget: z.coerce.number(), 
    startDate: z.coerce.date(),
    paymentDeadline: z.coerce.date(),
    
    prevOrder: z.coerce.number().optional(),
    nextOrder: z.coerce.number().optional(),
});

export const updatePhaseSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    startDate: z.coerce.date().optional(),
    budget: z.coerce.number().optional(),
    paymentDeadline: z.coerce.date().optional(),
});

export const phaseIdParamSchema = z.object({
    phaseId: z.uuid("Invalid Phase ID"),
});