import type { Request, Response } from "express";
import { logger } from "../../shared/lib/logger.js";
import { UnAuthorizedError } from "../../shared/error/unauthorized.error.js";
import catalogueService from "./catalogue.service.js";
import { deleteFormSchema, editFormSchema, formSchema, getCatalogueByIdSchema, getCatalogueSchema } from "./catalogue.schema.js";
import { ValidationError } from "../../shared/error/validation.error.js";
import { MissingError } from "../../shared/error/missing.error.js";

const catalogueController = {
    async getCatalogue(request: Request, response: Response) {

        try {
            const organizationId = request.tenant?.orgId;
            const index = Number.parseInt(request.query.index as string) || 0;
            const size = Number.parseInt(request.query.size as string) || 10;
            const searchQuery = (request.query.search as string) || "";

            const validatedData = getCatalogueSchema.safeParse({
                organizationId,
                pageIndex: index,
                pageSize: size,
                searchQuery,
            });

            if (!validatedData.success) {
                throw new ValidationError("Invalid Request Parameters");
            }
            const result = await catalogueService.getCatalogue(
                validatedData.data.organizationId,
                validatedData.data.pageIndex,
                validatedData.data.pageSize,
                validatedData.data.searchQuery
            );
            logger.info(`Catalogue fetched successfully for organization ${validatedData.data.organizationId}`);
            return response.status(200).json(result)
        } catch (error) {
            logger.error(error);
            if(error instanceof UnAuthorizedError) {
                return response.status(401).json({
                    success: false,
                    message: error.message
                })
            }
            return response.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    },

    async getCatalogueById(request: Request, response: Response) {
        try {
            const organizationId = request.tenant?.orgId;
            const catalogueId = request.params.catalogueId;
            const quoteId = request.params.quoteId;

            const validatedData = getCatalogueByIdSchema.safeParse({
                catalogueId,
                quoteId
            })
            if(!validatedData.success) {
                throw new ValidationError("Invalid Request Parameters");
            }
            const result = await catalogueService.getCatalogueById(
                validatedData.data.catalogueId,
                validatedData.data.quoteId,
                organizationId as string
            );
            logger.info(`Catalogue fetched successfully for organization ${organizationId}`);
            return response.status(200).json(result)
        } catch (error) {
            logger.error(error);
            if(error instanceof ValidationError) {
                return response.status(400).json({
                    message: error.message
                })
            }
            return response.status(500).json({
                message: "Internal server error",
            })
        }
    },

    async createCatalogue(request: Request, response: Response) {
        try {
            const orgId = request.tenant?.orgId;
            if(request.tenant?.role !== "ADMIN") {
                throw new UnAuthorizedError("Unauthorized");
            }

            const validatedData = formSchema.safeParse(request.body);

            if(!validatedData.success) {
                throw new ValidationError("Invalid Entries")
            }

            const result = await catalogueService.createCatalogue(validatedData.data, orgId as string)
            if(!result) {
                throw new Error("Internal Server Error")
            }
            return response.status(200).json({
                success: true,
                message: "Catalogue created successfully",
            })

        } catch (error) {
            if(error instanceof UnAuthorizedError) {
                return response.status(401).json({
                    success: false,
                    message: error.message
                })
            }
            if(error instanceof ValidationError) {
                return response.status(400).json({
                    success: false,
                    message: error.message
                })
            }
            logger.error(error);
            return response.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    },

    async editCatalogue(request: Request, response: Response) {
        try {
            
            const orgId = request.tenant?.orgId
            if(request.tenant?.role !== "ADMIN") {
                throw new UnAuthorizedError("Unauthorized");
            }
            const validatedData = editFormSchema.safeParse(request.body);
            if(!validatedData.success) {
                throw new ValidationError("Invalid Entries")
            }
            
            await catalogueService.editCatalogue(validatedData.data, orgId as string)
            
            return response.status(200).json({
                success: true,
                message: "Catalogue edited successfully",
            })
        } catch (error) {
            if(error instanceof UnAuthorizedError) {
                return response.status(401).json({
                    success: false,
                    message: error.message
                })
            }
            if(error instanceof ValidationError) {
                return response.status(400).json({
                    success: false,
                    message: error.message
                })
            }
            if(error instanceof MissingError) {
                return response.status(404).json({
                    success: false,
                    message: error.message
                })
            }
            if(error instanceof Error && error.message.includes("already exists")) {
                return response.status(409).json({
                    success: false,
                    message: "Supplier exist for that Item"
                })
            }
            logger.error(error);
            return response.status(500).json({
                success: false,
                message: "Internal server error",
            })
        }
    },

    async deleteCatalogue(request: Request, response: Response) {
        try {
            const orgId = request.tenant?.orgId
            if (request.tenant?.role !== "ADMIN") {
                throw new UnAuthorizedError("Unauthorized");
            }

            const validatedData = deleteFormSchema.safeParse(request.body);

            if(!validatedData.success) {
                throw new ValidationError("Invalid Entries")
            }

            await catalogueService.deleteCatalogue(validatedData.data, orgId as string)

            return response.status(200).json({
                success: true,
                message: "Catalogue deleted successfully",
            })
        } catch (error) {
            if (error instanceof UnAuthorizedError) {
                return response.status(401).json({
                    success: false,
                    message: error.message
                })
            }
            if(error instanceof ValidationError) {
                return response.status(400).json({
                    success: false,
                    message: error.message
                })
            }
            if(error instanceof MissingError) {
                return response.status(404).json({
                    success: false,
                    message: error.message
                })
            }
            logger.error(error);
            return response.status(500).json({
                success: false,
                message: "Internal server error",
            })
        }
    }
}

export default catalogueController;