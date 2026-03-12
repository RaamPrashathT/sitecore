import type { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger";
import { ValidationError } from "../error/validation.error";
import redis from "../lib/redis";

export const projectAuthorize = (
    request: Request,
    response: Response,
    next: NextFunction,
) => {
    try {
        const sessionId = request.session!.userId;
        const organizationId = request.tenant!.orgId;
        const incomingProjectId = request.headers["x-project-id"];

        if (!incomingProjectId || typeof incomingProjectId !== "string") {
            throw new ValidationError("Project ID missing"); 
        }

        request.project = {
            id: incomingProjectId,
        };
        next();

    } catch (error) {
        if(error instanceof ValidationError) {
            return response.status(400).json({
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
