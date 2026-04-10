import type { Request, Response } from "express";
import requisitionService from "./requisition.service.js";
import { logger } from "../../../shared/lib/logger.js";
import { ValidationError } from "../../../shared/error/validation.error.js";
import {
    createRequisitionSchema,
    getPaymentPendingSchema,
    phaseIdParamSchema,
    requisitionIdParamSchema,
    requisitionSlugParamSchema,
} from "./requisition.schema.js";

const requisitionController = {
    async createRequisition(request: Request, response: Response) {
        try {
            const projectId = request.project!.id;
            const requestedBy = request.session!.userId;

            const validatedParams = phaseIdParamSchema.safeParse(
                request.params,
            );
            if (!validatedParams.success) {
                throw new ValidationError("Invalid Phase ID format");
            }

            const validatedData = createRequisitionSchema.safeParse(
                request.body,
            );
            if (!validatedData.success) {
                throw new ValidationError(validatedData.error.message);
            }

            const result = await requisitionService.createRequisition(
                projectId,
                validatedParams.data.phaseId,
                requestedBy,
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

    async getProjectRequisitions(request: Request, response: Response) {
        try {
            const projectId = request.project!.id;

            const result =
                await requisitionService.getProjectRequisitions(projectId);

            return response.status(200).json(result);
        } catch (error) {
            logger.error(error);
            return response
                .status(500)
                .json({ message: "Internal server error" });
        }
    },

    async getRequisitionDetails(request: Request, response: Response) {
        try {
            const projectId = request.project!.id;

            const validatedParams = requisitionSlugParamSchema.safeParse(request.params);
            if (!validatedParams.success) {
                throw new ValidationError("Invalid URL format for requisition");
            }

            const result = await requisitionService.getRequisitionDetails(
                projectId,
                validatedParams.data.phaseSlug,
                validatedParams.data.requisitionSlug
            );

            return response.status(200).json(result);
        } catch (error) {
            if (error instanceof ValidationError) {
                return response.status(404).json({ message: error.message });
            }
            logger.error(error);
            return response.status(500).json({ message: "Internal server error" });
        }
    },

    async getPendingRequisitions(request: Request, response: Response) {
        try {
            const organizationId = request.tenant!.orgId;
            const index = Number.parseInt(request.query.index as string) ?? 0;
            const size = Number.parseInt(request.query.size as string) ?? 10;
            const searchQuery = (request.query.search as string) || "";

            const validatedData = getPaymentPendingSchema.safeParse({
                organizationId,
                pageIndex: index,
                pageSize: size,
                searchQuery,
            });

            if (!validatedData.success) {
                throw new ValidationError("Invalid Organization ID");
            }

            const result = await requisitionService.getPendingRequisitions(
                validatedData.data.organizationId,
                validatedData.data.pageIndex,
                validatedData.data.pageSize,
                validatedData.data.searchQuery,
            );

            return response.status(200).json(result);
        } catch (error) {
            logger.error(error);
            if (error instanceof ValidationError) {
                return response.status(400).json({ message: error.message });
            }
            return response.status(500).json({
                message: "Internal server error",
            });
        }
    },

    async approveRequisition(request: Request, response: Response) {
        try {
            const validatedParams = requisitionIdParamSchema.safeParse(
                request.params,
            );
            if (!validatedParams.success) {
                throw new ValidationError("Invalid Requisition ID format");
            }

            await requisitionService.approveRequisition(
                validatedParams.data.requisitionId,
            );

            return response
                .status(200)
                .json({ message: "Requisition approved successfully" });
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

    async rejectRequisition(request: Request, response: Response) {
        try {
            const validatedParams = requisitionIdParamSchema.safeParse(
                request.params,
            );
            if (!validatedParams.success) {
                throw new ValidationError("Invalid Requisition ID format");
            }

            await requisitionService.rejectRequisition(
                validatedParams.data.requisitionId,
            );

            return response
                .status(200)
                .json({ message: "Requisition rejected successfully" });
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
    async getRequisitionCatalogue(request: Request, response: Response) {
        try {
            const projectId = request.project!.id;
            const phaseSlug = request.params.phaseSlug as string;
            
            const index = Number.parseInt(request.query.index as string) || 0;
            const size = Number.parseInt(request.query.size as string) || 24;
            const search = (request.query.search as string) || "";

            if (!phaseSlug) {
                throw new ValidationError("Phase slug is required");
            }

            const result = await requisitionService.getRequisitionCatalogue(
                projectId,
                phaseSlug,
                index,
                size,
                search
            );

            return response.status(200).json(result);
        } catch (error) {
            if (error instanceof ValidationError) {
                return response.status(400).json({ message: error.message });
            }
            logger.error(error);
            return response.status(500).json({ message: "Internal server error" });
        }
    },  
    async getAllPhaseRequisitions(request: Request, response: Response) {
        try {
            const projectId = request.project!.id;
            const phaseSlug = request.params.phaseSlug as string;

            if (!phaseSlug) {
                throw new ValidationError("Phase slug is required");
            }

            const result = await requisitionService.getAllPhaseRequisitions(projectId, phaseSlug);
            return response.status(200).json(result);
        } catch (error) {
            if (error instanceof ValidationError) {
                return response.status(404).json({ message: error.message });
            }
            logger.error(error);
            return response.status(500).json({ message: "Internal server error" });
        }
    },
};

export default requisitionController;
