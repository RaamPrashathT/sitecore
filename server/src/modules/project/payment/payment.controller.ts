import type { Request, Response } from "express";
import paymentService from "./payment.service.js";
import { logger } from "../../../shared/lib/logger.js";
import { ValidationError } from "../../../shared/error/validation.error.js";
import { requestDrawSchema, paymentIdParamSchema } from "./payment.schema.js";

const paymentController = {
    async createDraw(request: Request, response: Response) {
        try {
            const projectId = request.project!.id;
            const phaseId = request.params.phaseId as string;
            
            const validatedData = requestDrawSchema.safeParse(request.body);
            if (!validatedData.success) throw new ValidationError(validatedData.error.message);

            const result = await paymentService.generateDrawRequest(
                projectId, 
                phaseId, 
                validatedData.data
            );

            return response.status(201).json(result);
        } catch (error) {
            logger.error(error);
            const status = error instanceof ValidationError ? 400 : 500;
            return response.status(status).json({ message: error instanceof Error ? error.message : "Internal error" });
        }
    },

    async approvePayment(request: Request, response: Response) {
        try {
            const validatedParams = paymentIdParamSchema.safeParse(request.params);
            if (!validatedParams.success) throw new ValidationError("Invalid Payment ID");

            const result = await paymentService.recordPayment(validatedParams.data.paymentId);
            return response.status(200).json(result);
        } catch (error) {
            logger.error(error);
            return response.status(500).json({ message: "Internal server error" });
        }
    }
};

export default paymentController;