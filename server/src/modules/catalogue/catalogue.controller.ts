import type { Request, Response } from "express";
import { logger } from "../../shared/lib/logger";
import { UnAuthorizedError } from "../../shared/error/unauthorized.error";
import catalogueService from "./catalogue.service";

const catalogueController = {
    async getCatalogue(request: Request, response: Response) {
        try {
            if(request.tenant?.role !== "ADMIN") {
                throw new UnAuthorizedError("Unauthorized");
            }
            const result = await catalogueService.getCatalogue(request.tenant.orgId)
            return response.status(200).json({
                success: true,
                message: "Catalogue fetched successfully",
                data: result
            })
        } catch (error) {
            if(error instanceof UnAuthorizedError) {
                return response.status(401).json({
                    success: false,
                    message: error.message
                })
            }
            logger.error(error);
            return response.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }
}

export default catalogueController;