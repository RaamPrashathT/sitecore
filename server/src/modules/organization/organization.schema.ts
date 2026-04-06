import { z } from "zod";

export const createOrganizationSchema = z.object({
    name: z.string().trim().min(3).max(80),
});

export const orgSlugSchema = z
    .string()
    .min(1, "Organization name is required")
    .max(50, "Organization name is too long")
    .trim()
    .regex(/^[a-z0-9-]+$/, "Invalid Organization name(slug)");

export const updateOrganizationSchema = z
    .object({
        name: z.string().trim().min(3).max(80).optional(),
        image: z.url("Invalid image URL").optional(),
    })
    .refine((data) => data.name !== undefined || data.image !== undefined, {
        message: "At least one field (name or image) must be provided",
    });

export type UpdateOrganizationBody = z.infer<typeof updateOrganizationSchema>;

export type CreateOrganizationBody = z.infer<typeof createOrganizationSchema>;
