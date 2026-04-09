import { resend } from "../resend.js";
import { logger } from "../logger.js";

interface OrderItem {
    itemName: string;
    quantity: number;
    unit: string;
    truePrice: number;
}

export async function sendSupplierOrderNotification(
    supplierEmail: string,
    supplierName: string,
    items: OrderItem[],
    projectLocation: string,
    organizationName: string,
) {
    try {
        const fromAddress =
            process.env.NODE_ENV === "production"
                ? "orders<no-reply@gmail.com>"
                : "orders@resend.dev";

        const itemsHtml = items
            .map(
                (item) => `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 12px; text-align: left; font-size: 14px; color: #333;">
                    ${item.itemName}
                </td>
                <td style="padding: 12px; text-align: center; font-size: 14px; color: #333;">
                    ${item.quantity} ${item.unit}
                </td>
                <td style="padding: 12px; text-align: right; font-size: 14px; color: #333;">
                    ₹${item.truePrice.toFixed(2)}
                </td>
            </tr>
        `,
            )
            .join("");

        const totalAmount = items.reduce(
            (sum, item) => sum + item.truePrice * item.quantity,
            0,
        );

        const { data, error } = await resend.emails.send({
            from: fromAddress,
            to: "raamthiruna@gmail.com",
            subject: `New Order from ${organizationName}`,
            html: `
                <div style="font-family: sans-serif; max-width: 640px; margin: auto; border: 1px solid #ddd; padding: 24px; border-radius: 10px; background-color: #f9f9f9;">
                    
                    <h2 style="color: #111; margin-bottom: 8px;">
                        New Order Received
                    </h2>
                    
                    <p style="color: #666; font-size: 14px; margin-bottom: 24px;">
                        Hello ${supplierName},
                    </p>

                    <p style="font-size: 14px; color: #444; line-height: 1.6; margin-bottom: 16px;">
                        We would like to order the following materials to be sent to our project location:
                    </p>

                    <p style="font-size: 13px; color: #666; margin-bottom: 24px; background-color: #f0f0f0; padding: 12px; border-radius: 6px; border-left: 4px solid #15803d;">
                        <strong>Project Location:</strong> ${projectLocation}
                    </p>

                    <div style="margin-bottom: 24px; background-color: white; border-radius: 6px; overflow: hidden; border: 1px solid #eee;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background-color: #15803d; color: white;">
                                    <th style="padding: 12px; text-align: left; font-weight: 600; font-size: 14px;">
                                        Item Name
                                    </th>
                                    <th style="padding: 12px; text-align: center; font-weight: 600; font-size: 14px;">
                                        Quantity
                                    </th>
                                    <th style="padding: 12px; text-align: right; font-weight: 600; font-size: 14px;">
                                        Unit Price
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                            </tbody>
                        </table>
                    </div>

                    <div style="background-color: #f0f0f0; padding: 16px; border-radius: 6px; margin-bottom: 24px; text-align: right;">
                        <p style="font-size: 14px; color: #666; margin: 0 0 8px 0;">
                            <strong>Total Amount:</strong> ₹${totalAmount.toFixed(2)}
                        </p>
                    </div>

                    <p style="font-size: 14px; color: #444; line-height: 1.6; margin-bottom: 24px;">
                        Please confirm the availability and expected delivery date. If you have any questions or need clarification on this order, please don't hesitate to contact us.
                    </p>

                    <p style="font-size: 13px; color: #777;">
                        Thank you for your business!<br/>
                        <strong>${organizationName}</strong>
                    </p>

                    <hr style="border: none; border-top: 1px solid #ddd; margin: 24px 0;">

                    <p style="font-size: 11px; color: #aaa; margin: 0;">
                        This is an automated email. Please do not reply directly to this address. If you have any questions, please contact us through our platform.
                    </p>
                </div>
            `,
        });

        if (error) {
            logger.error("Resend Email Error:", error);
            return { success: false, error };
        }

        logger.info(
            `Order notification sent to supplier ${supplierName} (${supplierEmail})`,
        );
        return { success: true, data };
    } catch (err) {
        logger.error("Failed to send supplier order notification:", err);
        return { success: false, error: err };
    }
}
