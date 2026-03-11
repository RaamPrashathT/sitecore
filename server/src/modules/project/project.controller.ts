import type { Request, Response } from "express";
import projectService from "./project.service";
import { logger } from "../../shared/lib/logger";

const projectController = {
    async createProject(request: Request, response: Response) {
        try {
            const organizationId = request.tenant!.orgId;
            const projectName = request.body.projectName;

            const result = await projectService.createProject({
                organizationId,
                projectName,
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
    }
};

export default projectController;
