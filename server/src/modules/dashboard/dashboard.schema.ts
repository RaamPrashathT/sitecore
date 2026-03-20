import z from "zod";

export const getDashboardItemsSchema = z.object({
    organizationId: z.string().length(36),
    pageIndex: z.number().min(0),
    pageSize: z.number().min(1),
    searchQuery: z.string().max(500)
})

export const setDashboardItemsSchema = z.object({
    requisitionItemIds: z.array(z.string().length(36)),
    organizationId: z.string().length(36)
})

export type SetDashboardItemsType = z.infer<typeof setDashboardItemsSchema>;
export type GetDashboardItemsType = z.infer<typeof getDashboardItemsSchema>;