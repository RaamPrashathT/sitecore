import type { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger.js";

export const requiredRole = (
    requiredRole: string
) => async (
    request: Request,
    response: Response,
    next: NextFunction,
) => {
    try {
        const role = request.tenant?.role

        if (requiredRole === role) {
            return next()
        }
        return response.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    } catch (error) {
        logger.error(error);
        return response.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}