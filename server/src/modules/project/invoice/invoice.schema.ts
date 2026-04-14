import z from "zod";

export const generateInvoiceParamsSchema = z.object({
    phaseId: z.string().min(1, "Invalid Phase ID"),
});

export const getInvoicesParamsSchema = z.object({
    phaseId: z.string().min(1, "Invalid Phase ID"),
});

export const payInvoiceParamsSchema = z.object({
    invoiceId: z.string().min(1, "Invalid Invoice ID"),
});

export const sendInvoiceParamsSchema = z.object({
    invoiceId: z.string().min(1, "Invalid Invoice ID"),
});

export const sendInvoiceBodySchema = z.object({
    // no body needed — invoice data is fetched server-side
});
