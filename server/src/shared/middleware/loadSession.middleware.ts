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
        } catch {
            logger.error("Invalid session JSON");
        }

        return next();
    } catch (error) {
        logger.error(error);
        return response.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
    
}