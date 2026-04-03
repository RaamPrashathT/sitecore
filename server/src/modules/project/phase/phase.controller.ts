import type { Request, Response } from "express";
import phaseService from "./phase.service.js";
import { logger } from "../../../shared/lib/logger.js";
import { ValidationError } from "../../../shared/error/validation.error.js";
import {
    createPhaseSchema,
    phaseIdParamSchema,
    phaseSlugParamSchema,
    updatePhaseSchema,
} from "./phase.schema.js";

const phaseController = {
    async createPhase(request: Request, response: Response) {
        try {
            const projectId = request.project!.id;

            const validatedData = createPhaseSchema.safeParse(request.body);
            if (!validatedData.success) {
                throw new ValidationError(validatedData.error.message);
            }

            const result = await phaseService.createPhase(
                projectId,
                validatedData.data,
            );

            return response.status(201).json(result);
        } catch (error) {
            logger.error(error);
            return response
                .status(500)
                .json({ message: "Internal server error" });
        }
    },

    async getProjectTimeline(request: Request, response: Response) {
        try {
            const projectId = request.project!.id;
            const result = await phaseService.getProjectTimeline(projectId);
            return response.status(200).json(result);
        } catch (error) {
            logger.error(error);
            return response
                .status(500)
                .json({ message: "Internal server error" });
        }
    },

    async getPhases(request: Request, response: Response) {
        try {
            const projectId = request.project!.id;
            console.log(projectId)
            const result = await phaseService.getPhases(projectId);
            return response.status(200).json(result);
        } catch (error) {
            logger.error(error);
            return response
                .status(500)
                .json({ message: "Internal server error" });
        }
    },

    async getPhaseDetails(request: Request, response: Response) {
        try {
            const projectId = request.project!.id;

            const validatedParams = phaseIdParamSchema.safeParse(
                request.params,
            );
            if (!validatedParams.success) {
                throw new ValidationError("Invalid Phase ID format");
            }

            const result = await phaseService.getPhaseDetails(
                projectId,
                validatedParams.data.phaseId,
            );

            return response.status(200).json(result);
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

    async getPhaseInfo(request: Request, response: Response) {
        try {
            const projectId = request.project!.id;

            const validatedParams = phaseSlugParamSchema.safeParse(
                request.params,
            );
            if (!validatedParams.success) {
                throw new ValidationError("Invalid Phase Slug format");
            }

            const result = await phaseService.getPhaseInfo(
                projectId,
                validatedParams.data.phaseSlug,
            );

            return response.status(200).json(result);
        } catch (error) {
            if (error instanceof ValidationError) {
                return response.status(404).json({ message: error.message });
            }
            logger.error(error);
            return response
                .status(500)
                .json({ message: "Internal server error" });
        }
    },

    async updatePhase(request: Request, response: Response) {
        try {
            const projectId = request.project!.id;

            const validatedParams = phaseIdParamSchema.safeParse(
                request.params,
            );
            if (!validatedParams.success) {
                throw new ValidationError("Invalid Phase ID format");
            }

            const validatedData = updatePhaseSchema.safeParse(request.body);
            if (!validatedData.success) {
                throw new ValidationError(validatedData.error.message);
            }

            const result = await phaseService.updatePhase(
                projectId,
                validatedParams.data.phaseId,
                validatedData.data,
            );

            return response.status(200).json(result);
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

    async deletePhase(request: Request, response: Response) {
        try {
            const projectId = request.project!.id;

            const validatedParams = phaseIdParamSchema.safeParse(
                request.params,
            );
            if (!validatedParams.success) {
                throw new ValidationError("Invalid Phase ID format");
            }

            await phaseService.deletePhase(
                projectId,
                validatedParams.data.phaseId,
            );

            return response
                .status(200)
                .json({ message: "Phase deleted successfully" });
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

    async requestPayment(request: Request, response: Response) {
        try {
            const projectId = request.project!.id;
            const validatedParams = phaseIdParamSchema.safeParse(
                request.params,
            );
            if (!validatedParams.success)
                throw new ValidationError("Invalid Phase ID");

            await phaseService.requestPayment(
                projectId,
                validatedParams.data.phaseId,
            );

            return response.status(200).json({
                message:
                    "Payment requested successfully. Phase is now PAYMENT_PENDING.",
            });
        } catch (error) {
            if (error instanceof ValidationError)
                return response.status(400).json({ message: error.message });
            logger.error(error);
            return response
                .status(500)
                .json({ message: "Internal server error" });
        }
    },

    async approvePayment(request: Request, response: Response) {
        try {
            const projectId = request.project!.id;
            const validatedParams = phaseIdParamSchema.safeParse(
                request.params,
            );
            if (!validatedParams.success)
                throw new ValidationError("Invalid Phase ID");

            await phaseService.approvePayment(
                projectId,
                validatedParams.data.phaseId,
            );

            return response
                .status(200)
                .json({ message: "Payment approved. Phase is now ACTIVE." });
        } catch (error) {
            if (error instanceof ValidationError)
                return response.status(400).json({ message: error.message });
            logger.error(error);
            return response
                .status(500)
                .json({ message: "Internal server error" });
        }
    },

    async completePhase(request: Request, response: Response) {
        try {
            const projectId = request.project!.id;
            const validatedParams = phaseIdParamSchema.safeParse(
                request.params,
            );
            if (!validatedParams.success)
                throw new ValidationError("Invalid Phase ID");

            await phaseService.completePhase(
                projectId,
                validatedParams.data.phaseId,
            );

            return response
                .status(200)
                .json({ message: "Phase marked as COMPLETED." });
        } catch (error) {
            if (error instanceof ValidationError)
                return response.status(400).json({ message: error.message });
            logger.error(error);
            return response
                .status(500)
                .json({ message: "Internal server error" });
        }
    },

    async getPaymentPendingPhases(request: Request, response: Response) {
        try {
            const organizationId = request.tenant!.orgId;

            const result =
                await phaseService.getPaymentPendingPhases(organizationId);

            return response.status(200).json(result);
        } catch (error) {
            logger.error(error);
            return response
                .status(500)
                .json({ message: "Internal server error" });
        }
    },

    async paymentApproval(request: Request, response: Response) {
        try {
            console.log("hi");
            const phaseId = request.body.id;
            console.log(phaseId);
            await phaseService.paymentApproval(phaseId);

            return response.status(200).json({
                message: "Payment approved successfully",
            });
        } catch (error) {
            logger.error(error);
            return response.status(500).json({
                message: "Internal server error",
            });
        }
    },
};

export default phaseController;
