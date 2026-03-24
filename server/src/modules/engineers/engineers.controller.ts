import type { Request, Response } from "express";
import { logger } from "../../shared/lib/logger.js";
import engineerService from "./engineers.service.js";
import { ValidationError } from "../../shared/error/validation.error.js";
import { getFormSchema } from "../clients/clients.schema.js";

const engineerController = {
    async getEngineers(request : Request, response: Response) {
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

            const clients = await engineerService.getEngineers(
                validatedData.data.organizationId,
                validatedData.data.pageIndex,
                validatedData.data.pageSize,
                validatedData.data.searchQuery,
            );
            return response.status(200).json(clients);
        } catch (error) {
            if (error instanceof ValidationError) {
                return response.status(401).json({
                    success: false,
                    message: error.message,
                });
            }
            logger.error(error);
            return response.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    },
}

export default engineerController;