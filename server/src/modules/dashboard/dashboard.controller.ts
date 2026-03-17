import type { Request, Response } from "express";
import { getDashboardItemsSchema } from "./dashboard.schema";
import { logger } from "../../shared/lib/logger";
import { ValidationError } from "../../shared/error/validation.error";
import dashboardService from "./dashboard.service";

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
};

export default dashboardController;
