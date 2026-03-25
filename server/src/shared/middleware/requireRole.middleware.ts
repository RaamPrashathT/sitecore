import type { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger.js";

export const requiredRole = (
    requiredRole: string | string[]
) => async (
    request: Request,
    response: Response,
    next: NextFunction,
) => {
    try {
        const userRole = request.tenant?.role
        const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        if (userRole && allowedRoles.includes(userRole)) {
            return next();
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