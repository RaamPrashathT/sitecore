import type { Request, Response } from "express";
import { logger } from "../../../shared/lib/logger.js";
import { ValidationError } from "../../../shared/error/validation.error.js";
import { MissingError } from "../../../shared/error/missing.error.js";
import { ConflictError } from "../../../shared/error/conflict.error.js";
import quoteHistoryService from "./quoteHistory.service.js";
import {
    getQuoteHistoryParamsSchema,
    getQuoteHistoryQuerySchema,
    getQuoteHistoryByIdParamsSchema,
} from "./quoteHistory.schema.js";

function handleError(
    error: unknown,
    orgId: string | undefined,
    resourceId: string | undefined,
    response: Response,
) {
    if (error instanceof ValidationError) {
        return response.status(400).json({ success: false, message: error.message });
    }
    if (error instanceof MissingError) {
        return response.status(404).json({ success: false, message: error.message });
    }
    if (error instanceof ConflictError) {
        return response.status(409).json({ success: false, message: error.message });
    }
    logger.error("Unexpected error in quoteHistory controller", {
        organizationId: orgId,
        resourceId,
        error: error instanceof Error ? error.stack : String(error),
    });
    return response.status(500).json({ success: false, message: "Internal server error" });
}

const quoteHistoryController = {
    async getQuoteHistory(request: Request, response: Response) {
        try {
            const paramsParsed = getQuoteHistoryParamsSchema.safeParse(request.params);
            if (!paramsParsed.success) {
                throw new ValidationError(paramsParsed.error.issues[0]?.message ?? "Invalid parameters");
            }

            const queryParsed = getQuoteHistoryQuerySchema.safeParse(request.query);
            if (!queryParsed.success) {
                throw new ValidationError(queryParsed.error.issues[0]?.message ?? "Invalid query parameters");
            }

            const orgId = request.tenant?.orgId;
            if (!orgId) throw new ValidationError("Organization context missing");

            const { index, size } = queryParsed.data;
            const result = await quoteHistoryService.getQuoteHistory(
                orgId,
                paramsParsed.data.quoteId,
                index,
                size,
            );

            return response.status(200).json({
                success: true,
                message: "Quote history fetched successfully",
                data: result.data,
                count: result.count,
            });
        } catch (error) {
            return handleError(error, request.tenant?.orgId, request.params["quoteId"] as string, response);
        }
    },

    async getQuoteHistoryById(request: Request, response: Response) {
        try {
            const parsed = getQuoteHistoryByIdParamsSchema.safeParse(request.params);
            if (!parsed.success) {
                throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid parameters");
            }

            const orgId = request.tenant?.orgId;
            if (!orgId) throw new ValidationError("Organization context missing");

            const data = await quoteHistoryService.getQuoteHistoryById(
                orgId,
                parsed.data.quoteId,
                parsed.data.historyId,
            );

            return response.status(200).json({
                success: true,
                message: "Quote history entry fetched successfully",
                data,
            });
        } catch (error) {
            return handleError(error, request.tenant?.orgId, request.params["quoteId"] as string, response);
        }
    },
};

export default quoteHistoryController;
