import z from "zod";

export const RegisterSchema = z.object({
    email: z.email("Invalid email address"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .max(64, "Password must be at most 64 characters long"),
    inviteToken: z.string().optional(),
});


export const LoginSchema = z.object({
    email: z.email("Invalid email address"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .max(64, "Password must be at most 64 characters long"),
})

export const ProfileSchema = z.object({
    sub: z.string(),
    name: z.string(),
    given_name: z.string(),
    family_name: z.string(),
    picture: z.string(),
    email: z.email(),
    email_verified: z.boolean(),
});

export type RegisterInputSchema = z.infer<typeof RegisterSchema>;
export type LoginInputSchema = z.infer<typeof LoginSchema>;  