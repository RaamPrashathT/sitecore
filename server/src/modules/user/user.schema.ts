import z from "zod";

export const OnboardingSchema = z.object({
    username: z.string().min(3).max(30),
    phone: z.string().min(10).max(15).optional(), 
    avatar: z.string().optional(),
    isTwoFactorEnabled: z.boolean().optional(),
});

export type OnboardingInputSchema = z.infer<typeof OnboardingSchema>;