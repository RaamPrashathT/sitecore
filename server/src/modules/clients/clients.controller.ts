import { ValidationError } from "../../shared/error/validation.error.js";
import { logger } from "../../shared/lib/logger.js";
import type { Request, Response } from "express";
import clientService from "./clients.service.js";
import { getFormSchema } from "./clients.schema.js";
import { UnAuthorizedError } from "../../shared/error/unauthorized.error.js";

const clientController = {
    async getClients(request: Request, response: Response) {
        try {
            const organizationId = request.tenant?.orgId;
            const index = Number.parseInt(request.query.index as string) || 0;
            const size = Number.parseInt(request.query.size as string) || 10;
            const searchQuery = (request.query.search as string) || "";

            const validatedData = getFormSchema.safeParse({
                organizationId,
                pageIndex: index,
                pageSize: size,
                searchQuery,
            });

            if (!validatedData.success) {
                throw new ValidationError("Invalid Organization ID");
            }

            const clients = await clientService.getClients(
                validatedData.data.organizationId,
                validatedData.data.pageIndex,
                validatedData.data.pageSize,
                validatedData.data.searchQuery,
            );
            return response.status(200).json(clients);
        } catch (error) {
            if (error instanceof ValidationError) {
                return response.status(400).json({ message: error.message });
            }
            logger.error(error);
            return response.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    },

    async createInvite(request: Request, response: Response) {
        try {
            await clientService.createInvite(
                request.tenant!.orgId,
                request.body,
            );
            return response.status(200).json({
                message: "Invite sent",
            });
        } catch (error) {
            logger.error(error);
            return response.status(500).json({
                message: "Internal server error",
            });
        }
    },

    async getInvitationDetails(request: Request, response: Response) {
        try {
            const token = request.query.token as string;
            if (!token) {
                throw new UnAuthorizedError("Token is required");
            }
            const invitation = await clientService.getInvitationDetails(token);
            return response.status(200).json(invitation);
        } catch (error) {
            if (error instanceof UnAuthorizedError) {
                return response.status(401).json({ message: error.message });
            }
            logger.error(error);
            return response.status(500).json({
                message: "Internal server error",
            });
        }
    },

    async acceptInvite(request: Request, response: Response) {
        try {
            const { token } = request.body;
            const { userId, email } = request.session!;

            if (!token) throw new ValidationError("Token is required");

            const result = await clientService.acceptInvitation(
                token,
                userId,
                email,
            );
            return response.status(200).json(result);
        } catch (error) {
            if (error instanceof UnAuthorizedError) {
                return response.status(403).json({ message: error.message });
            }
            logger.error(error);
            return response
                .status(500)
                .json({ message: "Internal server error" });
        }
    },
};

export default clientController;
