import type { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger";
import redis from "../lib/redis";

export const loadSession = async (
    request: Request,
    response: Response,
    next: NextFunction,
) => {
    try {
        const sessionId = request.cookies.session;
        if (!sessionId) return next();
        const raw = await redis.get(`session:${sessionId}`);
        if (!raw) return next();

        try {
            request.session = JSON.parse(raw);
        } catch(error) {
            logger.error("Session load failed", {
                traceId: request.traceId,
                service: "auth-service",
                endpoint: request.originalUrl,
                method: request.method,
                statusCode: 500,
                errorCode: "SESSION_LOAD_FAILED",
                errorDetails: error instanceof Error ? error.stack : String(error),
            });
        }

        return next();
    } catch (error) {
        logger.error("Invalid session JSON", {
            traceId: request.traceId,
            service: "auth-service",
            endpoint: request.originalUrl,
            method: request.method,
            userId: request.session?.userId,
            statusCode: 500,
            errorCode: "INVALID_SESSION_JSON",
        });
        return response.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
