import type { Request, Response } from "express";
import sitelogService from "./sitelog.service.js";
import { logger } from "../../../shared/lib/logger.js";
import { ValidationError } from "../../../shared/error/validation.error.js";
import {
    createSiteLogSchema,
    createCommentSchema,
    commentIdParamSchema,
    sitelogIdParamSchema,
} from "./sitelog.schema.js";

const sitelogController = {
    async createSiteLog(request: Request, response: Response) {
        try {
            const projectId = request.project!.id;
            const authorId = request.session!.userId;

            const validatedData = createSiteLogSchema.safeParse(request.body);
            if (!validatedData.success) {
                throw new ValidationError(validatedData.error.message);
            }

            const result = await sitelogService.createSiteLog(
                projectId,
                authorId,
                validatedData.data,
            );

            return response.status(201).json(result);
        } catch (error) {
            if (error instanceof ValidationError) {
                return response.status(400).json({ message: error.message });
            }
            logger.error(error);
            return response
                .status(500)
                .json({ message: "Internal server error" });
        }
    },

    async createComment(request: Request, response: Response) {
        try {
            const projectId = request.project!.id;
            const authorId = request.session!.userId;

            const validatedParams = sitelogIdParamSchema.safeParse(
                request.params,
            );
            if (!validatedParams.success) {
                throw new ValidationError("Invalid Site Log ID");
            }

            const validatedData = createCommentSchema.safeParse(request.body);
            if (!validatedData.success) {
                throw new ValidationError(
                    validatedData.error.issues[0]?.message ||
                        "Validation failed",
                );
            }

            const result = await sitelogService.createComment(
                projectId,
                validatedParams.data.sitelogId,
                authorId,
                validatedData.data,
            );

            return response.status(201).json(result);
        } catch (error) {
            if (error instanceof ValidationError) {
                return response.status(400).json({ message: error.message });
            }
            logger.error(error);
            return response
                .status(500)
                .json({ message: "Internal server error" });
        }
    },

    async deleteComment(request: Request, response: Response) {
        try {
            const projectId = request.project!.id;
            const userId = request.session!.userId;

            const validatedParams = commentIdParamSchema.safeParse(
                request.params,
            );
            if (!validatedParams.success) {
                throw new ValidationError("Invalid Comment ID format");
            }

            await sitelogService.deleteComment(
                projectId,
                validatedParams.data.commentId,
                userId,
            );

            return response
                .status(200)
                .json({ message: "Comment deleted successfully" });
        } catch (error) {
            if (error instanceof ValidationError) {
                return response.status(400).json({ message: error.message });
            }
            logger.error(error);
            return response
                .status(500)
                .json({ message: "Internal server error" });
        }
    },

    
};

export default sitelogController;