import { resend } from "../resend.js";
import { logger } from "../logger.js";

export async function sendVerificationEmail(email: string, otp: string) {
    try {
        const fromAddress = process.env.NODE_ENV === "production" 
            ? "SiteCore <no-reply@sitecore.com>" 
            : "onboarding@resend.dev";

        const { data, error } = await resend.emails.send({
            from: fromAddress,
            to: "raamthiruna@gmail.com",
            subject: `${otp} is your SiteCore verification code`,
            html: `
                <div style="font-family: sans-serif; max-width: 400px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #333;">Verify your email</h2>
                    <p style="font-size: 16px; color: #555;">Use the following One-Time Password (OTP) to complete your login:</p>
                    <div style="padding: 10px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #7e22ce; border-radius: 5px; margin: 20px 0;">
                        ${otp}
                    </div>
                    <p style="font-size: 12px; color: #999;">This code expires in 10 minutes. If you did not request this, please ignore this email.</p>
                </div>
            `,
        });

        if (error) {
            logger.error("Resend Email Error:", error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (err) {
        logger.error("Failed to send verification email:", err);
        return { success: false, error: err };
    }
}