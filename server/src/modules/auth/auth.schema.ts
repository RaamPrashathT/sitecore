import z from "zod";

export const registerSchema = z.object({
    email: z.email("Invalid email"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .max(64, "Password must be at most 64 characters long"),
});

export const loginSchema = z.object({
    email: z.email("Invalid email"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .max(64, "Password must be at most 64 characters long"),
})

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;


