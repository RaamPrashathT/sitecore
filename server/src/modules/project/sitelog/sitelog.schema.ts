import z from "zod";

export const createSiteLogSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    workDate: z.coerce.date(),
    images: z
        .array(z.string())
        .max(5, "You can only upload up to 5 images per log")
        .default([]),
    materialsConsumed: z
        .array(
            z.object({
                catalogueId: z.string().min(1, "catalogueId is required"),
                locationId: z.string().min(1, "locationId is required"),
                quantity: z.coerce.number().positive("Quantity must be positive"),
            }),
        )
        .default([]),
});

export const createCommentSchema = z.object({
    text: z.string().min(1, "Comment text cannot be empty"),
    imageId: z.string().nullable().optional(),
});

export const phaseIdParamSchema = z.object({
    phaseId: z.string().min(1, "Invalid Phase ID"),
});

export const imageIdParamSchema = z.object({
    imageId: z.string().min(1, "Invalid Image ID"),
});

export const commentIdParamSchema = z.object({
    commentId: z.string().min(1, "Invalid Comment ID"),
});

export const sitelogIdParamSchema = z.object({
    sitelogId: z.string().min(1, "Invalid Site Log ID format"),
});

