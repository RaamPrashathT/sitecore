import type { Request, Response } from "express";
import { logger } from "../../../shared/lib/logger.js";
import { ValidationError } from "../../../shared/error/validation.error.js";
import { MissingError } from "../../../shared/error/missing.error.js";
import { ConflictError } from "../../../shared/error/conflict.error.js";
import catalogueService from "./catalogue.service.js";
import {
    getCatalogueQuerySchema,
    catalogueIdParamSchema,
    createCatalogueBodySchema,
    editCatalogueBodySchema,
} from "./catalogue.schema.js";

function handleError(
    error: unknown,
    orgId: string | undefined,
    resourceId: string | undefined,
    response: Response,
) {
    if (error instanceof ValidationError) {
        return response
            .status(400)
            .json({ success: false, message: error.message });
    }
    if (error instanceof MissingError) {
        return response
            .status(404)
            .json({ success: false, message: error.message });
    }
    if (error instanceof ConflictError) {
        return response
            .status(409)
            .json({ success: false, message: error.message });
    }
    logger.error("Unexpected error in catalogue controller", {
        organizationId: orgId,
        resourceId,
        error: error instanceof Error ? error.stack : String(error),
    });
    return response
        .status(500)
        .json({ success: false, message: "Internal server error" });
}

const catalogueController = {
    async getCatalogue(request: Request, response: Response) {
        try {
            const parsed = getCatalogueQuerySchema.safeParse(request.query);
            if (!parsed.success) {
                throw new ValidationError(
                    parsed.error.issues[0]?.message ??
                        "Invalid query parameters",
                );
            }

            const orgId = request.tenant?.orgId;
            if (!orgId)
                throw new ValidationError("Organization context missing");

            const { search } = parsed.data;
            const result = await catalogueService.getCatalogue(orgId, search);

            return response.status(200).json({
                success: true,
                message: "Catalogue master list fetched successfully",
                data: result.list,
                count: result.count,
            });
        } catch (error) {
            return handleError(
                error,
                request.tenant?.orgId,
                undefined,
                response,
            );
        }
    },

    async getCatalogueById(request: Request, response: Response) {
        try {
            const parsed = catalogueIdParamSchema.safeParse(request.params);
            if (!parsed.success) {
                throw new ValidationError(
                    parsed.error.issues[0]?.message ?? "Invalid parameters",
                );
            }

            const orgId = request.tenant?.orgId;
            if (!orgId)
                throw new ValidationError("Organization context missing");

            const data = await catalogueService.getCatalogueById(
                orgId,
                parsed.data.catalogueId,
            );

            return response.status(200).json({
                success: true,
                message: "Catalogue fetched successfully",
                data,
            });
        } catch (error) {
            return handleError(
                error,
                request.tenant?.orgId,
                request.params["catalogueId"] as string,
                response,
            );
        }
    },

    async createCatalogue(request: Request, response: Response) {
        try {
            const parsed = createCatalogueBodySchema.safeParse(request.body);
            if (!parsed.success) {
                throw new ValidationError(
                    parsed.error.issues[0]?.message ?? "Invalid request body",
                );
            }

            const orgId = request.tenant?.orgId;
            if (!orgId)
                throw new ValidationError("Organization context missing");

            const data = await catalogueService.createCatalogue(
                orgId,
                parsed.data,
            );

            return response.status(201).json({
                success: true,
                message: "Catalogue created successfully",
                data,
            });
        } catch (error) {
            return handleError(
                error,
                request.tenant?.orgId,
                undefined,
                response,
            );
        }
    },

    async editCatalogue(request: Request, response: Response) {
        try {
            const paramsParsed = catalogueIdParamSchema.safeParse(
                request.params,
            );
            if (!paramsParsed.success) {
                throw new ValidationError(
                    paramsParsed.error.issues[0]?.message ??
                        "Invalid parameters",
                );
            }

            const bodyParsed = editCatalogueBodySchema.safeParse(request.body);
            if (!bodyParsed.success) {
                throw new ValidationError(
                    bodyParsed.error.issues[0]?.message ??
                        "Invalid request body",
                );
            }

            const orgId = request.tenant?.orgId;
            if (!orgId)
                throw new ValidationError("Organization context missing");

            const data = await catalogueService.editCatalogue(
                orgId,
                paramsParsed.data.catalogueId,
                bodyParsed.data,
            );

            return response.status(200).json({
                success: true,
                message: "Catalogue updated successfully",
                data,
            });
        } catch (error) {
            return handleError(
                error,
                request.tenant?.orgId,
                request.params["catalogueId"] as string,
                response,
            );
        }
    },

    async deleteCatalogue(request: Request, response: Response) {
        try {
            const parsed = catalogueIdParamSchema.safeParse(request.params);
            if (!parsed.success) {
                throw new ValidationError(
                    parsed.error.issues[0]?.message ?? "Invalid parameters",
                );
            }

            const orgId = request.tenant?.orgId;
            if (!orgId)
                throw new ValidationError("Organization context missing");

            await catalogueService.deleteCatalogue(
                orgId,
                parsed.data.catalogueId,
            );

            return response.status(200).json({
                success: true,
                message: "Catalogue deleted successfully",
            });
        } catch (error) {
            return handleError(
                error,
                request.tenant?.orgId,
                request.params["catalogueId"] as string,
                response,
            );
        }
    },
};

export default catalogueController;
