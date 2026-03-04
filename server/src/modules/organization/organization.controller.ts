import type { Request, Response } from "express";
import orgService from "./organization.service.js";
import { logger } from "../../shared/lib/logger.js";
import { createOrganizationSchema, orgSlugSchema } from "./organization.schema.js";
import { ValidationError } from "../../shared/error/validation.error.js";
import { UnAuthorizedError } from "../../shared/error/unauthorized.error.js";
import { ConflictError } from "../../shared/error/conflict.error.js";

import { MissingError } from "../../shared/error/missing.error.js";

const orgController = {
    async createOrg(request: Request, response: Response) {
        try {
            if (!request.session?.userId) {
                throw new UnAuthorizedError();
            }

            const input = {
                orgName: request.body.orgName,
                userId: request.session.userId,
            };

            const validatedData = createOrganizationSchema.safeParse(input);

            if (!validatedData.success) {
                throw new ValidationError(validatedData.error.message);
            }

            const result = await orgService.createOrg({
                orgName: validatedData.data.orgName.trim(),
                userId: request.session.userId,
            });

            return response.status(201).json({
                success: true,
                message: "Organization created",
                data: result,
            });
        } catch (error) {
            if (error instanceof UnAuthorizedError) {
                return response.status(401).json({
                    success: false,
                    message: error.message,
                });
            }
            if (error instanceof ConflictError) {
                return response.status(409).json({
                    success: false,
                    message: error.message,
                });
            }
            if (error instanceof ValidationError) {
                return response.status(400).json({
                    success: false,
                    message: error.message,
                });
            }
            logger.error(error);
            return response.status(500).json({
                success: false,
                message: "Something went wrong",
            });
        }
    },

    async getOrg(request: Request, response: Response) {
        try {
            const sessionId = request.session?.userId;

            const result = await orgService.getOrgs(sessionId as string);

            return response.status(200).json(result);
        } catch (error) {
            logger.error(error);
            return response.status(500).json({
                success: false,
                message: "Something went wrong",
            });
        }
    },

    async identity(request: Request, response: Response) {
        try {
            const validatedOrgName = orgSlugSchema.safeParse(
                request.body.orgName,
            );

            if (!validatedOrgName.success) {
                throw new ValidationError(validatedOrgName.error.message);
            }

            const input = {
                orgName: validatedOrgName.data,
                userId: request.session?.userId as string,
            };

            const result = await orgService.identity(input);
            return response.status(200).json({
                success: true,
                message: "Data fetched successfully",
                data: result,
            });
        } catch (error) {
            if (error instanceof ValidationError) {
                return response.status(400).json({
                    success: false,
                    message: error.message,
                });
            }
            if (error instanceof MissingError) {
                console.log("missing")
                return response.status(404).json({
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
    },
};

export default orgController;
