import z from "zod";

export const createProjectSchema = z.object({
    name: z.string().min(1),
    address: z.string().min(1),
    estimatedBudget: z.coerce.number(),
    engineerId: z.string().length(24),
    clientId: z.string().length(24),
})

export type CreateProjectBody = z.infer<typeof createProjectSchema>;