import * as z from "zod";

export const requestDrawSchema = z.object({
    // Optional: Admin can override the project's default retainage for a specific bill
    retainageOverride: z.coerce.number().min(0).max(100).optional(),
    applicationNumber: z.coerce.number().min(1)
});

export const paymentIdParamSchema = z.object({
    paymentId: z.string({ error: "Invalid Payment ID" }).check(z.uuid())
});