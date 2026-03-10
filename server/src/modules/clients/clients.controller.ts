import { ValidationError } from "../../shared/error/validation.error.js";
import { logger } from "../../shared/lib/logger.js";
import type { Request, Response } from "express";
import clientService from "./clients.service.js";


const clientController = {
    async getClients(request: Request, response: Response) {
        try {
            const orgId = request.tenant!.orgId

            if(typeof orgId !== 'string') {
                throw new ValidationError('Organization ID missing')
            }

            const clients = await clientService.getClients(orgId)

            return response.status(200).json(clients)
        } catch(error) {
            logger.error(error)
            return response.status(500).json({
                success: false,
                message: "Internal server error"
            })
        }
    }
}

export default clientController;