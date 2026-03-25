import z, { length } from "zod";

export const getFormSchema = z.object({
    organizationId: z.string().length(36),
    pageIndex: z.number().min(0),
    pageSize: z.number().min(1),
    searchQuery: z.string().max(500),
});

export const createInviteBodySchema = z.object({
    email: z.email("Invalid email address"),
    projects: z
        .array(z.string().length(36, "Invalid project ID"))
        .min(1, "At least one project is required"),
});

export type CreateInviteBodySchema = z.infer<typeof createInviteBodySchema>;
export type getFormSchema = z.infer<typeof getFormSchema>;
