import type { Request, Response } from "express";
import { logger } from "../../shared/lib/logger.js";
import { getFormSchema } from "./pending.schema.js";
import { ValidationError } from "../../shared/error/validation.error.js";
import pendingService from "./pending.service.js";

const pendingController = {
    async getPendingInvitations(request: Request, response: Response) {
        try {
            const organizationId = request.tenant?.orgId;
            const index = Number.parseInt(request.query.index as string) ?? 0;
            const size = Number.parseInt(request.query.size as string) ?? 10;
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
            const result = await pendingService.getInvitations(
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

    assignClient(request: Request, response: Response) {
        try {
            const organizationId = request.tenant?.orgId;
            const userId = request.body.userId;

            const result = pendingService.assignClient(
                organizationId!,
                userId,
            );

            return response.status(200).json(result);
        } catch (error) {
            logger.error(error);
            return response
                .status(500)
                .json({ message: "Internal server error" });
        }
    },

    assignEngineer(request: Request, response: Response) {
        try {
            const organizationId = request.tenant?.orgId;
            const userId = request.body.userId;

            const result = pendingService.assignEngineer(
                organizationId!,
                userId,
            );

            return response.status(200).json(result);
        } catch (error) {
            logger.error(error);
            return response
                .status(500)
                .json({ message: "Internal server error" });
        }
    },
};

export default pendingController;
