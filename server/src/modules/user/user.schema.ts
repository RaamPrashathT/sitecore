import z from "zod";

export const OnboardingSchema = z.object({
    username: z.string().min(3).max(30),
    phone: z.string().optional(), 
    avatar: z.url().optional(),
    isTwoFactorEnabled: z.boolean().default(false),
});

export type OnboardingInputSchema = z.infer<typeof OnboardingSchema>;