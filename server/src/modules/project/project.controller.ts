import type { Request, Response } from "express";
import projectService from "./project.service.js";
import { logger } from "../../shared/lib/logger.js";
import { createPhaseSchema, createProjectSchema, createRequisitionSchema, getPaymentPendingSchema, getProjectListSchema, RequisitionItemListSchema } from "./project.schema.js";
import { ValidationError } from "../../shared/error/validation.error.js";
import { MissingError } from "../../shared/error/missing.error.js";

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
            const organizationId = request.tenant?.orgId;
            const index = Number.parseInt(request.query.index as string) ?? 0;
            const size = Number.parseInt(request.query.size as string) ?? 10;
            const searchQuery = request.query.search as string || "";

            const validatedData = getProjectListSchema.safeParse({
                organizationId,
                pageIndex: index,
                pageSize: size,
                searchQuery,
            });

            if (!validatedData.success) {
                throw new ValidationError("Invalid Organization ID");
            }

            const result = await projectService.getProjects(
                validatedData.data.organizationId,
                validatedData.data.pageIndex,
                validatedData.data.pageSize,
                validatedData.data.searchQuery
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
            const phaseId = request.body.id;

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
                phaseId: validatedData.data.phaseId,
                budget: validatedData.data.budget
            })

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
            });
        }
    },

    async postRequisitionItems(request: Request, response: Response) {
        try {
            const validatedData = RequisitionItemListSchema.safeParse(request.body);

            if(!validatedData.success) {
                throw new ValidationError(validatedData.error.message)
            }

            const result = await projectService.postRequisitionItems(validatedData.data)
            return response.status(200).json(result);
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

    async getPaymentPendingPhases(request: Request, response: Response) {
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


            const result = await projectService.getPaymentPendingPhases(
                validatedData.data.organizationId,
                validatedData.data.pageIndex,
                validatedData.data.pageSize,
                validatedData.data.searchQuery,
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

    async getPendingRequisitions(request: Request, response: Response) {
        try {
            const organizationId = request.tenant!.orgId;

            const result = await projectService.getPendingRequisitions(organizationId);
            
            return response.status(200).json(result);
        } catch (error) {
            logger.error(error);
            return response.status(500).json({
                message: "Internal server error",
            });
        }
    },

    async getRequisitionDetails(request: Request, response: Response) {
        try {
            const { requisitionIdSlug } = request.params;

            const result = await projectService.getRequisitionDetails(requisitionIdSlug as string);

            return response.status(200).json(result);
        } catch (error) {
            if(error instanceof MissingError) {
                return response.status(404).json({
                    message: error.message
                })
            }
            logger.error(error);
            return response.status(500).json({
                message: "Internal server error",
            });
        }
    },

    async approveRequisition(request: Request, response: Response) {
        try {
            const { requisitionId } = request.body;

            await projectService.approveRequisition(requisitionId);

            return response.status(200).json({
                message: "Requisition approved successfully",
            });

        } catch (error) {
            if(error instanceof MissingError) {
                return response.status(404).json({
                    message: error.message
                })
            }
            logger.error(error);
            return response.status(500).json({
                message: "Internal server error",
            });
        }
    },

    async rejectRequisition(request: Request, response: Response) {
        try {
            const { requisitionId } = request.body;

            await projectService.rejectRequisition(requisitionId);

            return response.status(200).json({
                message: "Requisition approved successfully",
            });

        } catch (error) {
            if(error instanceof MissingError) {
                return response.status(404).json({
                    message: error.message
                })
            }
            logger.error(error);
            return response.status(500).json({
                message: "Internal server error",
            });
        }
    },
    
};

export default projectController;
