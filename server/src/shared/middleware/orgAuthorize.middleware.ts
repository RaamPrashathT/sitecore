import type { Request, Response, NextFunction } from "express";
import redis from "../lib/redis.js";
import { logger } from "../lib/logger.js";
import { UnAuthorizedError } from "../error/unauthorized.error";
import { ValidationError } from "../error/validation.error.js";

export const orgAuthorize = async (
    request: Request,
    response: Response,
    next: NextFunction,
) => {
    try {
        const incomingOrgId = request.headers["x-organization-id"];

        if (!incomingOrgId || typeof incomingOrgId !== "string") {
            throw new ValidationError("Organization ID missing");
        }

        const sessionId = request.cookies.session;

        if (!sessionId) {
            throw new UnAuthorizedError("Unauthorized");
        }

        const sessionStr = await redis.get(`session:${sessionId}`);

        if (!sessionStr) {
            throw new UnAuthorizedError("Unauthorized");
        }

        
        let sessionObj;
        try {
            sessionObj = JSON.parse(sessionStr);
        } catch {
            throw new UnAuthorizedError("Unauthorized");
        }

        const context = sessionObj.contexts?.[incomingOrgId];
        if (!context) {
            throw new UnAuthorizedError("Unauthorized");
        }

        request.tenant = {
            orgId: incomingOrgId,
            role: context.role,
        };
        next();
    } catch (error) {
        if (error instanceof UnAuthorizedError) {
            return response.status(401).json({
                success: false,
                message: error.message,
            });
        }
        logger.error(error);
        return response.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
