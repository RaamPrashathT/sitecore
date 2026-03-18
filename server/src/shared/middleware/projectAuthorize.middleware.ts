import type { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger.js";
import { ValidationError } from "../error/validation.error.js";

export const projectAuthorize = (
    request: Request,
    response: Response,
    next: NextFunction,
) => {
    try {
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
