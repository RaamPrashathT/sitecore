import type { Request, Response } from "express";
import { getDashboardItemsSchema, setDashboardItemsSchema } from "./dashboard.schema.js";
import { logger } from "../../shared/lib/logger.js";
import { ValidationError } from "../../shared/error/validation.error.js";
import dashboardService from "./dashboard.service.js";

const dashboardController = {
    async getDashboardItems(request: Request, response: Response) {
        try {
            const organizationId = request.tenant?.orgId;

            const validatedData = getDashboardItemsSchema.safeParse({
                organizationId,
            });

            if (!validatedData.success) {
                throw new ValidationError("Invalid Organization ID");
            }

            const result = await dashboardService.getDashboardItems(
                validatedData.data.organizationId
            );

            return response.status(200).json(result);
        } catch (error) {
            if (error instanceof ValidationError) {
                return response.status(400).json({ message: error.message });
            }
            logger.error(error);
            return response
                .status(500)
                .json({ message: "Something went wrong" });
        }
    },

    async setDashboardItems(request: Request, response: Response) {
        try {

            const validatedData = setDashboardItemsSchema.safeParse({
                requisitionItemIds: request.body.requisitionItemIds,
                organizationId: request.tenant?.orgId,
            });

            if (!validatedData.success) {
                throw new ValidationError("Invalid Organization ID");
            }
            const result = await dashboardService.setDashboardItems(
                validatedData.data
            );

            return response.status(200).json(result);
        } catch (error) {
            if (error instanceof ValidationError) {
                return response.status(400).json({ message: error.message });
            }
            logger.error(error);
            return response
                .status(500)
                .json({ message: "Something went wrong" });
        }
    }
};

export default dashboardController;
