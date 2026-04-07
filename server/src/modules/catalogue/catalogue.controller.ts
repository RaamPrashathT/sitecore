import type { Request, Response } from "express";
import { logger } from "../../shared/lib/logger.js";
import { UnAuthorizedError } from "../../shared/error/unauthorized.error.js";
import { ValidationError } from "../../shared/error/validation.error.js";
import { catalogueService } from "./catalogue.service.js";
import {
    createCatalogueSchema,
    type CreateCataloguePayload,
} from "./catalogue.schema.js";

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

            if (error instanceof ValidationError) {
                return response
                    .status(400)
                    .json({ success: false, message: error.message });
            }
            return response
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    },
};

export default catalogueController;
