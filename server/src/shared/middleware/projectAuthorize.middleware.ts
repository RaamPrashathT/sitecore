import type { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger.js";
import { ValidationError } from "../error/validation.error.js";
import { UnAuthorizedError } from "../error/unauthorized.error.js";
import { prisma } from "../lib/prisma.js";

export const projectAuthorize = async (
    request: Request,
    response: Response,
    next: NextFunction,
) => {
    try {
        const orgSlug = request.headers["x-tenant-slug"] as string;
        const projectSlug = request.headers["x-project-slug"] as string;
        if (!projectSlug || !orgSlug) {
            throw new UnAuthorizedError(
                "You don't have permission to access this project",
            );
        }
        let assignment;
        
        if (request.tenant?.role === "ADMIN") {
            const result = await prisma.project.findFirst({
                where: {
                    slug: projectSlug,
                    organization: {
                        slug: orgSlug,
                    },
                },select: {
                    id: true
                }
            });
            assignment = {
                projectId: result?.id
            }
        } else {
            assignment = await prisma.assignment.findFirst({
                where: {
                    userId: request.session!.userId,
                    project: {
                        slug: projectSlug,
                        organization: {
                            slug: orgSlug,
                        },
                    },
                },select: {
                    projectId: true,
                }
            });
        }

        if (!assignment?.projectId) {
            throw new UnAuthorizedError(
                "You don't have permission to access this project",
            );
        }

        request.project = {
            id: assignment.projectId,
        };

        next();
    } catch (error) {
        logger.error("Project authorization failed", {
            traceId: request.traceId,
            service: "project-service",
            endpoint: request.originalUrl,
            method: request.method,
            userId: request.session?.userId,
            statusCode:
                error instanceof ValidationError ? 400 :
                error instanceof UnAuthorizedError ? 401 : 500,
            errorCode:
                error instanceof ValidationError ? "INVALID_PROJECT_INPUT" :
                error instanceof UnAuthorizedError ? "PROJECT_UNAUTHORIZED" :
                "PROJECT_AUTH_FAILED",
            errorDetails: error instanceof Error ? error.stack : String(error),
        });
        if (error instanceof ValidationError) {
            return response.status(400).json({
                success: false,
                message: error.message,
            });
        }
        return response.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
