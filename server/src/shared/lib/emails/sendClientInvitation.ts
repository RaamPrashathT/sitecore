import { resend } from "../resend.js";
import { logger } from "../logger.js";

export async function sendInviteEmail(email: string, token: string) {
    try {
        const fromAddress =
            process.env.NODE_ENV === "production"
                ? "sitecore<no resply@gmail.com>"
                : "onboarding@resend.dev";

        const { data, error } = await resend.emails.send({
            from: fromAddress,
            to: "raamthiruna@gmail.com",
            subject: "You’ve been invited to join SiteCore",
            html: `
                <div style="font-family: sans-serif; max-width: 480px; margin: auto; border: 1px solid #eee; padding: 24px; border-radius: 10px;">
                    
                    <h2 style="color: #111; margin-bottom: 16px;">
                        You’ve been invited
                    </h2>

                    <p style="font-size: 14px; color: #444; line-height: 1.6;">
                        You have been invited to join a project on SiteCore. Click the button below to accept the invitation and get started.
                    </p>

                    <div style="text-align: center; margin: 24px 0;">
                        <a 
                            href="http://localhost:5173/invitation?token=${token}" 
                            style="
                                display: inline-block;
                                padding: 12px 20px;
                                background-color: #7e22ce;
                                color: #ffffff;
                                text-decoration: none;
                                font-weight: 600;
                                border-radius: 6px;
                                font-size: 14px;
                            "
                        >
                            Accept Invitation
                        </a>
                    </div>

                    <p style="font-size: 12px; color: #777; line-height: 1.5;">
                        This invitation link will expire in 10 minutes. If you did not expect this invitation, you can safely ignore this email.
                    </p>

                    <p style="font-size: 12px; color: #aaa; margin-top: 16px; word-break: break-all;">
                        If the button does not work, copy and paste this link into your browser:<br/>
                        http://localhost:5173/invitation?token=${token}
                    </p>
                </div>
            `,
        });

        if (error) {
            logger.error("Resend Email Error:", error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (err) {
        logger.error("Failed to send invite email:", err);
        return { success: false, error: err };
    }
}