import type { Request, Response, NextFunction } from "express";
import redis from "../lib/redis.js";
import { logger } from "../lib/logger.js";
import { UnAuthorizedError } from "../error/unauthorized.error.js";
import { ValidationError } from "../error/validation.error.js";

export const orgAuthorize = async (
    request: Request,
    response: Response,
    next: NextFunction,
) => {
    try {
        const incomingSlug = request.headers["x-tenant-slug"];
        if (!incomingSlug || typeof incomingSlug !== "string") {
            throw new ValidationError("Tenant slug missing");
        }

        const sessionId = request.cookies.session;
        if (!sessionId) throw new UnAuthorizedError("Unauthorized");

        const sessionStr = await redis.get(`session:${sessionId}`);
        if (!sessionStr) throw new UnAuthorizedError("Unauthorized");

        let sessionObj;
        try {
            sessionObj = JSON.parse(sessionStr);
        } catch {
            throw new UnAuthorizedError("Unauthorized");
        }

        const tenant = sessionObj.tenant?.[incomingSlug];

        if (!tenant) {
            throw new UnAuthorizedError(
                "You do not have access to this organization",
            );
        }

        request.tenant = {
            orgId: tenant.id,
            role: tenant.role,
        };

        next();
    } catch (error) {
        logger.error("Organization authorization failed", {
            traceId: request.traceId,
            service: "auth-service",
            endpoint: request.originalUrl,
            method: request.method,
            userId: request.session?.userId,
            statusCode:
                error instanceof ValidationError
                    ? 400
                    : error instanceof UnAuthorizedError
                      ? 401
                      : 500,
            errorCode:
                error instanceof ValidationError
                    ? "INVALID_TENANT_SLUG"
                    : error instanceof UnAuthorizedError
                      ? "ORG_UNAUTHORIZED"
                      : "ORG_AUTH_FAILED",
            errorDetails: error instanceof Error ? error.stack : String(error),
        });
        if (error instanceof ValidationError) {
            return response
                .status(400)
                .json({ success: false, message: error.message });
        }
        if (error instanceof UnAuthorizedError) {
            return response
                .status(401)
                .json({ success: false, message: error.message });
        }
        return response
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
};
