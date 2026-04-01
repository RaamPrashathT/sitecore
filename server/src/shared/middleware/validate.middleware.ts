import type { ZodType } from "zod";
import type { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger";

export const validate =
    (schema: ZodType) =>
    (request: Request, response: Response, next: NextFunction): void => {
        const validatedData = schema.safeParse(request.body);
        if (!validatedData.success) {
            logger.error("Request validation failed", {
                traceId: request.traceId,
                service: "api-gateway",
                endpoint: request.originalUrl,
                method: request.method,
                statusCode: 400,
                errorCode: "VALIDATION_FAILED",
                errorDetails: JSON.stringify(validatedData.error.format()),
            });
            return;
        }
        request.body = validatedData.data;
        next();
    };
