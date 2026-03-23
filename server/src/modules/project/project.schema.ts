import z from "zod";

export const createProjectSchema = z.object({
    name: z.string().min(1),
    address: z.string().min(1),
    estimatedBudget: z.coerce.number(),
    engineerId: z.string().length(24),
    clientId: z.string().length(24),
});

export const createPhaseSchema = z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    budget: z.coerce.number(),
    paymentDeadline: z.coerce.date(),
    startDate: z.coerce.date(),
});

export const getProjectListSchema = z.object({
    organizationId: z.string().length(36),
    pageIndex: z.number().min(0),
    pageSize: z.number().min(1),
    searchQuery: z.string().max(500),
});

export const createRequisitionSchema = z.object({
    phaseId: z.string().length(36),
    budget: z.coerce.number(),
});

export const RequisitionItemListSchema = z.object({
    cartItems: z.array(
        z.object({
            catalogueId: z.string().length(36),
            supplierId: z.string().length(36),
            estimatedCost: z.coerce.number(),
            quantity: z.coerce.number(),
        }),
    ),
    requisitionId: z.string().length(36),
    totalCost: z.coerce.number(),
});

export const getPaymentPendingSchema = z.object({
    organizationId: z.string().length(36),
    pageIndex: z.number().min(0),
    pageSize: z.number().min(1),
    searchQuery: z.string().max(500),
});

export type RequisitionItemListBody = z.infer<typeof RequisitionItemListSchema>;
export type CreateProjectBody = z.infer<typeof createProjectSchema>;
export type CreatePhaseBody = z.infer<typeof createPhaseSchema>;
export type CreateRequisitionBody = z.infer<typeof createRequisitionSchema>;
