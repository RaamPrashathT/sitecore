import type { Request, Response, NextFunction } from "express";
import redis from "../lib/redis.js";
import { logger } from "../lib/logger.js";

export const authorize = async (
    request: Request,
    response: Response,
    next: NextFunction,
) => {
    try {
        const unauthorized = () =>
            response.status(401).json({
                success: false,
                message: "Unauthorized",
            });

        const sessionId = request.cookies.session;
        if (!sessionId) return unauthorized();

        const raw = await redis.get(`session:${sessionId}`);
        if (!raw) return unauthorized();

        let session;

        try {
            session = JSON.parse(raw);
        } catch {
            logger.error("Invalid session JSON");
            return unauthorized();
        }

        if (!session?.userId) return unauthorized();

        request.session = session;

        return next();
    } catch (error) {
        logger.error(error);
        return response.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
