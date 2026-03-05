import type { Request, Response } from "express";
import { logger } from "../../shared/lib/logger";
import { UnAuthorizedError } from "../../shared/error/unauthorized.error";
import catalogueService from "./catalogue.service";
import { formSchema } from "./catalogue.schema";
import { ValidationError } from "../../shared/error/validation.error";

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
    },

    async createCatalogue(request: Request, response: Response) {
        try {
            const orgId = request.tenant?.orgId;
            if(request.tenant?.role !== "ADMIN") {
                throw new UnAuthorizedError("Unauthorized");
            }

            const validatedData = formSchema.safeParse(request.body);

            if(!validatedData.success) {
                throw new ValidationError("Invalid Entries")
            }

            const result = await catalogueService.createCatalogue(request.body, orgId as string)
            if(!result) {
                throw new Error("Internal Server Error")
            }
            return response.status(200).json({
                success: true,
                message: "Catalogue created successfully",
            })

        } catch (error) {
            if(error instanceof UnAuthorizedError) {
                return response.status(401).json({
                    success: false,
                    message: error.message
                })
            }
            if(error instanceof ValidationError) {
                return response.status(400).json({
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