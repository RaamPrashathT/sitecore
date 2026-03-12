import type { Request, Response } from "express";
import projectService from "./project.service.js";
import { logger } from "../../shared/lib/logger.js";
import { createProjectSchema } from "./project.schema.js";
import { ValidationError } from "../../shared/error/validation.error.js";

const projectController = {
    async createProject(request: Request, response: Response) {
        try {
            const organizationId = request.tenant!.orgId;
        
            const validatedData = createProjectSchema.safeParse(request.body);
            if(!validatedData.success) {
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
            return response.status(500).json({ message: "Internal server error" });
        }
    },

    async getProjectDetails(request: Request, response: Response) {
        try {
            const { projectSlug } = request.params;
            const organizationId = request.tenant!.orgId;

            if(!projectSlug) {
                throw new ValidationError("Project slug is required");
            }

            const result = await projectService.getProjectDetails(projectSlug as string, organizationId);

            return response.status(200).json(result);
        } catch (error) {
            if(error instanceof ValidationError) {
                return response.status(400).json({
                    message: error.message
                })
            }
            logger.error(error)
            return response.status(500).json({
                message: "Internal server error"
            })
        }
    }
};

export default projectController;
