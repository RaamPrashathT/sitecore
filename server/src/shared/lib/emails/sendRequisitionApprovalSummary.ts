import { resend } from "../resend.js";
import { logger } from "../logger.js";

interface ApprovalSummaryItem {
    itemName: string;
    standardRate: number;
    quantity: number;
    totalAmount: number;
}

export async function sendRequisitionApprovalSummaryEmail(
    projectName: string,
    phaseName: string,
    items: ApprovalSummaryItem[],
    totalAmount: number,
) {
    try {
        const fromAddress =
            process.env.NODE_ENV === "production"
                ? "SiteCore <no-reply@sitecore.com>"
                : "orders@resend.dev";

        const itemsHtml = items
            .map(
                (item) => `
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 12px; text-align: left; font-size: 14px; color: #333;">
                            ${item.itemName}
                        </td>
                        <td style="padding: 12px; text-align: right; font-size: 14px; color: #333;">
                            ₹${item.standardRate.toFixed(2)}
                        </td>
                        <td style="padding: 12px; text-align: center; font-size: 14px; color: #333;">
                            ${item.quantity}
                        </td>
                        <td style="padding: 12px; text-align: right; font-size: 14px; color: #333;">
                            ₹${item.totalAmount.toFixed(2)}
                        </td>
                    </tr>
                `,
            )
            .join("");

        const { data, error } = await resend.emails.send({
            from: fromAddress,
            to: "raamthiruna@gmail.com",
            subject: `Requisition Approved - ${projectName}`,
            html: `
                <div style="font-family: sans-serif; max-width: 720px; margin: auto; border: 1px solid #ddd; padding: 24px; border-radius: 10px; background-color: #fafafa;">
                    <h2 style="color: #111; margin-bottom: 8px;">Requisition Approved</h2>

                    <p style="font-size: 14px; color: #444; line-height: 1.6; margin-bottom: 16px;">
                        The requisition for <strong>${projectName}</strong> has been approved for phase <strong>${phaseName}</strong>.
                    </p>

                    <div style="margin-bottom: 24px; background-color: white; border-radius: 6px; overflow: hidden; border: 1px solid #eee;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background-color: #15803d; color: white;">
                                    <th style="padding: 12px; text-align: left; font-weight: 600; font-size: 14px;">Item</th>
                                    <th style="padding: 12px; text-align: right; font-weight: 600; font-size: 14px;">Standard Rate</th>
                                    <th style="padding: 12px; text-align: center; font-weight: 600; font-size: 14px;">Quantity</th>
                                    <th style="padding: 12px; text-align: right; font-weight: 600; font-size: 14px;">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                            </tbody>
                        </table>
                    </div>

                    <div style="background-color: #f0f0f0; padding: 16px; border-radius: 6px; text-align: right;">
                        <p style="font-size: 14px; color: #666; margin: 0;">
                            <strong>Total Amount to be Paid:</strong> ₹${totalAmount.toFixed(2)}
                        </p>
                    </div>
                </div>
            `,
        });

        if (error) {
            logger.error("Resend Email Error:", error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (err) {
        logger.error("Failed to send requisition approval summary email:", err);
        return { success: false, error: err };
    }
}