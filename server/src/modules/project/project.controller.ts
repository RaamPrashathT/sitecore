import type { Request, Response } from "express";
import projectService from "./project.service.js";
import { logger } from "../../shared/lib/logger.js";
import { createPhaseSchema, createProjectSchema, createRequisitionSchema, RequistionItemListSchema } from "./project.schema.js";
import { ValidationError } from "../../shared/error/validation.error.js";

const projectController = {
    async createProject(request: Request, response: Response) {
        try {
            const organizationId = request.tenant!.orgId;

            const validatedData = createProjectSchema.safeParse(request.body);
            if (!validatedData.success) {
                throw new ValidationError(validatedData.error.message);
            }

            const result = await projectService.createProject({
                organizationId,
                projectName: validatedData.data.name,
                address: validatedData.data.address,
                estimatedBudget: validatedData.data.estimatedBudget,
                engineerId: validatedData.data.engineerId,
                clientId: validatedData.data.clientId,
            });
            return response.status(200).json(result);
        } catch (error) {
            logger.error(error);
            return response
                .status(500)
                .json({ message: "Internal server error" });
        }
    },

    async getProjects(request: Request, response: Response) {
        try {
            const organizationId = request.tenant!.orgId;

            const result = await projectService.getProjects(organizationId);

            return response.status(200).json(result);
        } catch (error) {
            logger.error(error);
            return response
                .status(500)
                .json({ message: "Internal server error" });
        }
    },

    async getProjectDetails(request: Request, response: Response) {
        try {
            const { projectSlug } = request.params;
            const organizationId = request.tenant!.orgId;

            if (!projectSlug) {
                throw new ValidationError("Project slug is required");
            }

            const result = await projectService.getProjectDetails(
                projectSlug as string,
                organizationId,
            );

            return response.status(200).json(result);
        } catch (error) {
            if (error instanceof ValidationError) {
                return response.status(400).json({
                    message: error.message,
                });
            }
            logger.error(error);
            return response.status(500).json({
                message: "Internal server error",
            });
        }
    },

    async createPhase(request: Request, response: Response) {
        try {

            const projectId = request.project!.id;
            console.log(projectId)
            const validatedData = createPhaseSchema.safeParse(request.body);

            if (!validatedData.success) {
                throw new ValidationError(validatedData.error.message);
            }

            await projectService.createPhase({
                projectId,
                data: validatedData.data,
            });

            return response.status(200).json({
                message: "Phase created successfully",
            });
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

            const result = await projectService.getPhases(projectId);

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
            const phaseId = request.body.phaseId;
            await projectService.paymentApproval(phaseId);

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

    async createRequisition(request: Request, response: Response) {
        try {
            const userId = request.session!.userId;

            const validatedData = createRequisitionSchema.safeParse(request.body);

            if(!validatedData.success) {
                throw new ValidationError(validatedData.error.message)
            }

            const result = await projectService.createRequisition({
                userId,
                phaseId: validatedData.data.phaseId
            })

            return response.status(200).json(result)
        } catch (error) {
            if(error instanceof ValidationError) {
                return response.status(400).json({
                    message: error.message
                })
            }
            logger.error(error);
            return response.status(500).json({
                message: "Internal server error",
            });
        }
    },

    async createRequistionItems(request: Request, response: Response) {
        try {
            const requisitionId = request.body.requisitionId;
            const validatedData = RequistionItemListSchema.safeParse(request.body.items);
            const phaseId = request.body.phaseId;


            if(!validatedData.success) {
                throw new ValidationError(validatedData.error.message)
            }

            const result = await projectService.createRequistionItems({
                requisitionId,
                phaseId,
                items: validatedData.data
            })

            return response.status(200).json(result)
        } catch (error) {
            if(error instanceof ValidationError) {
                return response.status(400).json({
                    message: error.message
                })
            }
            logger.error(error);
            return response.status(500).json({
                message: "Internal server error",
            });
        }
    }
};

export default projectController;
