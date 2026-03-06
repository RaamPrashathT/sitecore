import { z } from "zod";

export const createOrganizationSchema = z.object({
    name: z.string().trim().min(3).max(80)
});

export const orgSlugSchema = z
    .string()
    .min(1, "Organization name is required")
    .max(50, "Organization name is too long")
    .trim()
    .regex(/^[a-z0-9-]+$/, "Invalid Organization name(slug)")

export type CreateOrganizationBody = z.infer<typeof createOrganizationSchema>;