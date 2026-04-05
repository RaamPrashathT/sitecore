import z from "zod";

export const getDashboardItemsSchema = z.object({
    organizationId: z.string().length(36),
    searchQuery: z.string().max(500).optional().default("")
})

export const setDashboardItemsSchema = z.object({
    requisitionItemIds: z.array(z.string().length(36)),
    organizationId: z.string().length(36)
})

export type SetDashboardItemsType = z.infer<typeof setDashboardItemsSchema>;
export type GetDashboardItemsType = z.infer<typeof getDashboardItemsSchema>;