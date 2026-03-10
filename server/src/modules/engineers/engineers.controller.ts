import type { Request, Response } from "express";
import { logger } from "../../shared/lib/logger.js";
import engineerService from "./engineers.service.js";
import { ValidationError } from "../../shared/error/validation.error.js";

const engineerController = {
    async getEngineers(request : Request, response: Response) {
        try {
            const orgId = request.tenant!.orgId

            if(typeof orgId !== 'string') {
                throw new ValidationError('Organization ID missing')
            } 

            const engineers = await engineerService.getEngineers(orgId)

            return response.status(200).json(engineers)
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