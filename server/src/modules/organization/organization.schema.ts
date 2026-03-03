import { z } from "zod";

export const createOrganizationSchema = z.object({
    orgName: z.string(),
    userId: z.string(),
})

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>