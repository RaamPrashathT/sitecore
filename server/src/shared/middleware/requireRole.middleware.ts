import type { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger.js";

export const requiredRole =
    (requiredRole: string | string[]) =>
    async (request: Request, response: Response, next: NextFunction) => {
        try {
            const userRole = request.tenant?.role;
            const allowedRoles = Array.isArray(requiredRole)
                ? requiredRole
                : [requiredRole];
            if (userRole && allowedRoles.includes(userRole)) {
                return next();
            }

            logger.error("Role authorization failed", {
                traceId: request.traceId,
                service: "sitecore-service",
                endpoint: request.originalUrl,
                method: request.method,
                userId: request.session?.userId,
                statusCode: 401,
                errorCode: "INSUFFICIENT_ROLE",
            });
            return response.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        } catch (error) {
            logger.error("Role middleware error", {
                traceId: request.traceId,
                service: "sitecore-service",
                endpoint: request.originalUrl,
                method: request.method,
                userId: request.session?.userId,
                statusCode: 500,
                errorCode: "ROLE_MIDDLEWARE_FAILED",
                errorDetails: error instanceof Error ? error.stack : String(error),
            });
            return response.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    };
