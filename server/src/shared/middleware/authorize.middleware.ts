import type { Request, Response, NextFunction } from "express";
import redis from "../lib/redis.js";
import { logger } from "../lib/logger.js";
import { UnAuthorizedError } from "../error/unauthorized.error.js";

export const authorize = async (
    request: Request,
    response: Response,
    next: NextFunction,
) => {
    try {
        console.log("hi")
        const sessionId = request.cookies.session;
        if (!sessionId) throw new UnAuthorizedError();
        const raw = await redis.get(`session:${sessionId}`);
        if (!raw) throw new UnAuthorizedError();

        let session;

        try {
            session = JSON.parse(raw);
        } catch {
            logger.error("Invalid session JSON");
            throw new UnAuthorizedError();
        }
        if (!session?.userId) throw new UnAuthorizedError();
        request.session = session;
        return next();
    } catch (error) {
        logger.error("Authorization failed", {
            traceId: request.traceId,
            service: "auth-service",
            endpoint: request.originalUrl,
            method: request.method,
            userId: request.session?.userId,
            statusCode: 401,
            errorCode: "UNAUTHORIZED",
            errorDetails: error instanceof Error ? error.stack : String(error),
        });
        if (error instanceof UnAuthorizedError) {
            return response.status(401).json({
                success: false,
                message: error.message,
            });
        }
        return response.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
