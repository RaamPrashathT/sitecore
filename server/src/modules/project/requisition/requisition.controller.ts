import type { Request, Response } from "express";
import requisitionService from "./requisition.service.js";
import { logger } from "../../../shared/lib/logger.js";
import { ValidationError } from "../../../shared/error/validation.error.js";
import { createRequisitionSchema, phaseIdParamSchema, requisitionIdParamSchema } from "./requisition.schema.js";

const requisitionController = {
    async createRequisition(request: Request, response: Response) {
        try {
            const projectId = request.project!.id;
            const requestedBy = request.session!.userId;
            
            const validatedParams = phaseIdParamSchema.safeParse(request.params);
            if (!validatedParams.success) {
                throw new ValidationError("Invalid Phase ID format");
            }

            const validatedData = createRequisitionSchema.safeParse(request.body);
            if (!validatedData.success) {
                throw new ValidationError(validatedData.error.message);
            }

            const result = await requisitionService.createRequisition(
                projectId, 
                validatedParams.data.phaseId, 
                requestedBy,
                validatedData.data.items
            );
            
            return response.status(201).json(result);
        } catch (error) {
            if (error instanceof ValidationError) {
                return response.status(400).json({ message: error.message });
            }
            logger.error(error);
            return response.status(500).json({ message: "Internal server error" });
        }
    },

    async approveRequisition(request: Request, response: Response) {
        try {
            const projectId = request.project!.id;
            
            const validatedParams = requisitionIdParamSchema.safeParse(request.params);
            if (!validatedParams.success) {
                throw new ValidationError("Invalid Requisition ID format");
            }

            await requisitionService.approveRequisition(projectId, validatedParams.data.requisitionId);
            
            return response.status(200).json({ message: "Requisition approved successfully" });
        } catch (error) {
            if (error instanceof ValidationError) {
                return response.status(400).json({ message: error.message });
            }
            logger.error(error);
            return response.status(500).json({ message: "Internal server error" });
        }
    },

    async rejectRequisition(request: Request, response: Response) {
        try {
            const projectId = request.project!.id;
            
            const validatedParams = requisitionIdParamSchema.safeParse(request.params);
            if (!validatedParams.success) {
                throw new ValidationError("Invalid Requisition ID format");
            }

            await requisitionService.rejectRequisition(projectId, validatedParams.data.requisitionId);
            
            return response.status(200).json({ message: "Requisition rejected successfully" });
        } catch (error) {
            if (error instanceof ValidationError) {
                return response.status(400).json({ message: error.message });
            }
            logger.error(error);
            return response.status(500).json({ message: "Internal server error" });
        }
    }
};

export default requisitionController;