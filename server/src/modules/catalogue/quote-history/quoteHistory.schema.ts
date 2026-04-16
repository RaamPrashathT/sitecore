import { z } from "zod";

export const getQuoteHistoryParamsSchema = z.object({
    quoteId: z.string().min(1, "quoteId is required"),
});
export type GetQuoteHistoryParams = z.infer<typeof getQuoteHistoryParamsSchema>;

export const getQuoteHistoryQuerySchema = z.object({
    index: z.coerce.number().int().min(0).default(0),
    size: z.coerce.number().int().min(1).max(100).default(10),
});
export type GetQuoteHistoryQuery = z.infer<typeof getQuoteHistoryQuerySchema>;

export const getQuoteHistoryByIdParamsSchema = z.object({
    quoteId: z.string().min(1, "quoteId is required"),
    historyId: z.string().min(1, "historyId is required"),
});
export type GetQuoteHistoryByIdParams = z.infer<typeof getQuoteHistoryByIdParamsSchema>;
