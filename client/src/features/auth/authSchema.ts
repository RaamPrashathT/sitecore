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

const tenantSchema = z.record(
    z.string(),
    z.object({
      id: z.string(),
      role: z.string(),
    })
  );

export const sessionSchema = z.object({
    userId: z.string(),
    email: z.string(),
    username: z.string(),
    onboarded: z.boolean(),
    profileImage: z.string().optional(),
    tenant: tenantSchema
})


export const onboardSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters").max(30, "Username is too long"),
    phone: z.string().max(15, "Phone number is too long").optional(),
    avatar: z.url().optional(),
    isTwoFactorEnabled: z.boolean().default(false).optional(), 
});

export type OnboardInput = z.infer<typeof onboardSchema>;
export type SessionInput = z.infer<typeof sessionSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;