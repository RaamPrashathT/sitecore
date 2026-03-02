import type { Request, Response, NextFunction } from "express";
import redis from "../lib/redis.js";
import { logger } from "../lib/logger.js";

export const authorize = async (
    request: Request,
    response: Response,
    next: NextFunction,
) => {
    try {
        const sessionId = request.cookies.session;

        if (!sessionId) {
            return response.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const raw = await redis.get(`session:${sessionId}`);

        if (!raw) {
            return response
                .status(401)
                .json({ success: false, message: "Unauthorized" });
        }

        request.session = JSON.parse(raw as string);
        next();
    } catch (error) {
        logger.error(error);
        return response.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
