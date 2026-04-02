import type { Request, Response } from "express";
import coreService from "./core.service.js";
import { logger } from "../../../shared/lib/logger.js";
import { assignMemberSchema, createInviteSchema, createProjectSchema, getProjectListSchema, removeMemberSchema, updateProjectSchema } from "./core.schema.js";
import { ValidationError } from "../../../shared/error/validation.error.js";

const coreController = {
    async createProject(request: Request, response: Response) {
        try {
            const organizationId = request.tenant!.orgId;

            const validatedData = createProjectSchema.safeParse(request.body);
            if (!validatedData.success) {
                throw new ValidationError(validatedData.error.message);
            }

            const result = await coreService.createProject({
                organizationId,
                projectName: validatedData.data.name,
                address: validatedData.data.address,
                estimatedBudget: validatedData.data.estimatedBudget,
            });
            
            return response.status(201).json(result);
        } catch (error) {
            logger.error(error);
            return response.status(500).json({ message: "Internal server error" });
        }
    },

    async getProjects(request: Request, response: Response) {
        try {
            const organizationId = request.tenant?.orgId;
            const index = Number.parseInt(request.query.index as string) ?? 0;
            const size = Number.parseInt(request.query.size as string) ?? 10;
            const searchQuery = (request.query.search as string) || "";
            
            const validatedData = getProjectListSchema.safeParse({
                organizationId,
                pageIndex: index,
                pageSize: size,
                searchQuery,
            });
            
            if (!validatedData.success) {
                throw new ValidationError("Invalid Pagination Parameters");
            }

            const result = await coreService.getProjects(
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
            return response.status(500).json({ message: "Internal server error" });
        }
    },

    async getProjectDetails(request: Request, response: Response) {
        try {
            const projectId = request.project!.id; 

            const result = await coreService.getProjectDetails(projectId);
            return response.status(200).json(result);
        } catch (error) {
            logger.error(error);
            return response.status(500).json({ message: "Internal server error" });
        }
    },

    async updateProject(request: Request, response: Response) {
        try {
            const projectId = request.project!.id;

            const validatedData = updateProjectSchema.safeParse(request.body);
            if (!validatedData.success) {
                throw new ValidationError(validatedData.error.message);
            }

            const result = await coreService.updateProject(projectId, validatedData.data);
            
            return response.status(200).json(result);
        } catch (error) {
            logger.error(error);
            return response.status(500).json({ message: "Internal server error" });
        }
    },

    async getMembers(request: Request, response: Response) {
        try {
            const projectId = request.project!.id;
            const organizationId = request.tenant!.orgId;

            const result = await coreService.getMembers(projectId, organizationId);
            return response.status(200).json(result);
        } catch (error) {
            logger.error(error);
            return response.status(500).json({ message: "Internal server error" });
        }
    },

    async assignMember(request: Request, response: Response) {
        try {
            const projectId = request.project!.id;
            const organizationId = request.tenant!.orgId;

            const validatedData = assignMemberSchema.safeParse(request.body);
            if (!validatedData.success) {
                throw new ValidationError(validatedData.error.message);
            }

            await coreService.assignMember(
                projectId, 
                organizationId, 
                validatedData.data.userId, 
                validatedData.data.role
            );
            
            return response.status(200).json({ message: "Member assigned successfully" });
        } catch (error) {
            if (error instanceof ValidationError) {
                return response.status(400).json({ message: error.message });
            }
            logger.error(error);
            return response.status(500).json({ message: "Internal server error" });
        }
    },

    async removeMember(request: Request, response: Response) {
        try {
            const projectId = request.project!.id;

            const validatedData = removeMemberSchema.safeParse(request.body);
            if (!validatedData.success) {
                throw new ValidationError(validatedData.error.message);
            }

            await coreService.removeMember(projectId, validatedData.data.userId);
            
            return response.status(200).json({ message: "Member removed successfully" });
        } catch (error) {
            logger.error(error);
            return response.status(500).json({ message: "Internal server error" });
        }
    },

    async createInvitation(request: Request, response: Response) {
        try {
            const projectId = request.project!.id;
            const organizationId = request.tenant!.orgId;

            const validatedData = createInviteSchema.safeParse(request.body);
            if (!validatedData.success) {
                throw new ValidationError(validatedData.error.message);
            }

            await coreService.createInvite(
                organizationId,
                projectId,
                validatedData.data.email,
                validatedData.data.role
            );

            return response.status(200).json({ message: "Invite sent successfully" });
        } catch (error) {
            if (error instanceof ValidationError) {
                return response.status(400).json({ message: error.message });
            }
            logger.error(error);
            return response.status(500).json({ message: "Internal server error" });
        }
    },

    
};

export default coreController;