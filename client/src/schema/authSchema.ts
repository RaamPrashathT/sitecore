import { z } from "zod";

export const loginSchema = z.object({
    email: z.email("Invalid email"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .max(64, "Password must be at most 64 characters long"),
});

export const registerSchema = loginSchema.extend({
    email: z.email("Invalid email"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .max(64, "Password must be at most 64 characters long"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;