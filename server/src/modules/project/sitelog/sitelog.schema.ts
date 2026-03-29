import z from "zod";

export const createSiteLogSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    workDate: z.coerce.date(), 
    images: z.array(z.string().url("Invalid image URL"))
             .max(5, "You can only upload up to 5 images per log")
             .default([]),
});

export const createCommentSchema = z.object({
    text: z.string()
          .min(1, "Comment cannot be empty")
          .max(1000, "Comment is too long"),
});

export const phaseIdParamSchema = z.object({
    phaseId: z.uuid("Invalid Phase ID"),
});

export const imageIdParamSchema = z.object({
    imageId: z.uuid("Invalid Image ID"),
});

export const commentIdParamSchema = z.object({
    commentId: z.uuid("Invalid Comment ID"),
});