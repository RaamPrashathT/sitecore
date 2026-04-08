import type { Request, Response } from "express";
import { logger } from "../../shared/lib/logger.js";
import { UnAuthorizedError } from "../../shared/error/unauthorized.error.js";
import { ValidationError } from "../../shared/error/validation.error.js";
import { catalogueService } from "./catalogue.service.js";
import {
    createCatalogueSchema,
    type CreateCataloguePayload,
    deleteCatalogueSchema,
    updateCatalogueSchema,
    type UpdateCataloguePayload,
} from "./catalogue.schema.js";
import { Prisma } from "../../shared/lib/prisma.js";
import { z } from "zod";

const catalogueIdParamsSchema = z.object({
    id: z.string().uuid("Invalid catalogue ID"),
});

const catalogueController = {
    async getCatalogue(request: Request, response: Response) {
        try {
            const organizationId = request.tenant?.orgId;
            const index = Number.parseInt(request.query.index as string) || 0;
            const size = Number.parseInt(request.query.size as string) || 10;
            const searchQuery = (request.query.search as string) || "";

            const result = await catalogueService.getCatalogue(
                organizationId as string,
                index,
                size,
                searchQuery,
            );

            return response.status(200).json({ success: true, ...result });
        } catch (error) {
            logger.error(error);
            if (error instanceof UnAuthorizedError) {
                return response
                    .status(401)
                    .json({ success: false, message: error.message });
            }
            return response
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    },

    async createCatalogue(request: Request, response: Response) {
        try {
            const orgId = request.tenant?.orgId;
            const userId = request.session?.userId;
            console.log("User ID from session:", userId);

            const validatedData = createCatalogueSchema.safeParse(request.body);

            if (!validatedData.success) {
                const firstError =
                    validatedData.error.issues[0]?.message || "Invalid Entries";
                throw new ValidationError(firstError);
            }

            const result = await catalogueService.createCatalogue(
                orgId as string,
                userId as string,
                validatedData.data as CreateCataloguePayload,
            );

            return response.status(201).json({
                success: true,
                message: "Catalogue item created successfully",
                data: result,
            });
        } catch (error) {
            logger.error(error);

            if (error instanceof UnAuthorizedError) {
                return response
                    .status(401)
                    .json({ success: false, message: error.message });
            }
            if (error instanceof ValidationError) {
                return response
                    .status(400)
                    .json({ success: false, message: error.message });
            }

            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === "P2002") {
                    const target =
                        (error.meta?.target as string[])?.join(", ") || "field";
                    return response.status(400).json({
                        success: false,
                        message: `Duplicate entry error. A record with this ${target} already exists.`,
                    });
                }
                if (error.code === "P2003") {
                    return response.status(400).json({
                        success: false,
                        message:
                            "Invalid reference. The supplier or location ID provided does not exist.",
                    });
                }
                return response.status(400).json({
                    success: false,
                    message: "Database operation failed due to invalid data.",
                });
            }

            return response
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    },

    async updateCatalogue(request: Request, response: Response) {
        try {
            const orgId = request.tenant?.orgId;

            const validatedParams = catalogueIdParamsSchema.safeParse(
                request.params,
            );
            if (!validatedParams.success) {
                const firstError =
                    validatedParams.error.issues[0]?.message ||
                    "Invalid catalogue ID";
                throw new ValidationError(firstError);
            }

            const validatedBody = updateCatalogueSchema.safeParse(request.body);
            if (!validatedBody.success) {
                const firstError =
                    validatedBody.error.issues[0]?.message || "Invalid entries";
                throw new ValidationError(firstError);
            }

            const result = await catalogueService.updateCatalogue(
                orgId as string,
                validatedParams.data.id,
                validatedBody.data as UpdateCataloguePayload,
            );

            return response.status(200).json({
                success: true,
                message: "Catalogue item updated successfully",
                data: result,
            });
        } catch (error) {
            logger.error(error);

            if (error instanceof UnAuthorizedError) {
                return response
                    .status(401)
                    .json({ success: false, message: error.message });
            }
            if (error instanceof ValidationError) {
                return response
                    .status(400)
                    .json({ success: false, message: error.message });
            }

            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === "P2002") {
                    const target =
                        (error.meta?.target as string[])?.join(", ") || "field";
                    return response.status(400).json({
                        success: false,
                        message: `Duplicate entry error. A record with this ${target} already exists.`,
                    });
                }
                if (error.code === "P2025") {
                    return response.status(404).json({
                        success: false,
                        message:
                            "Catalogue item or its related active record was not found.",
                    });
                }
            }

            return response
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    },

    async deleteCatalogue(request: Request, response: Response) {
        try {
            const orgId = request.tenant?.orgId;

            const validatedParams = deleteCatalogueSchema.safeParse(
                request.params,
            );
            if (!validatedParams.success) {
                const firstError =
                    validatedParams.error.issues[0]?.message ||
                    "Invalid catalogue ID";
                throw new ValidationError(firstError);
            }

            await catalogueService.deleteCatalogue(
                orgId as string,
                validatedParams.data.id,
            );

            return response.status(200).json({
                success: true,
                message: "Catalogue item deleted successfully",
            });
        } catch (error) {
            logger.error(error);

            if (error instanceof UnAuthorizedError) {
                return response
                    .status(401)
                    .json({ success: false, message: error.message });
            }
            if (error instanceof ValidationError) {
                return response
                    .status(400)
                    .json({ success: false, message: error.message });
            }

            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === "P2025") {
                    return response.status(404).json({
                        success: false,
                        message: "Catalogue item not found.",
                    });
                }
            }

            return response
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    },
};

export default catalogueController;
