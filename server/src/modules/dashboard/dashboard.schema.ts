import z from "zod";

export const getDashboardItemsSchema = z.object({
    organizationId: z.string().length(36),
    searchQuery: z.string().max(500).optional().default("")
})

export const orderItemSchema = z.object({
    requisitionItemId: z.string().length(36),
    deductInventoryQty: z.number().min(0),
    organizationId: z.string().length(36)
});

export type SetDashboardItemsType = z.infer<typeof orderItemSchema>;
export type GetDashboardItemsType = z.infer<typeof getDashboardItemsSchema>;