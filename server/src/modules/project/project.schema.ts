import z from "zod";

export const createProjectSchema = z.object({
    name: z.string().min(1),
    address: z.string().min(1),
    estimatedBudget: z.coerce.number(),
    engineerId: z.string().length(24),
    clientId: z.string().length(24),
})

export const createPhaseSchema = z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    budget: z.coerce.number(),
    paymentDeadline: z.coerce.date()
})

export type CreateProjectBody = z.infer<typeof createProjectSchema>;
export type CreatePhaseBody = z.infer<typeof createPhaseSchema>;