import z from "zod";

export const tokenSchema = z.object({
    userId: z.string(),
    email: z.email(),
    tokenType: z.enum(["access", "refresh"]),
    iat: z.number().optional(),
    exp: z.number().optional(),
})