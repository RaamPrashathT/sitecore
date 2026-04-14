import type { Request, Response } from "express";
import invoiceService from "./invoice.service.js";
import { logger } from "../../../shared/lib/logger.js";
import { ValidationError } from "../../../shared/error/validation.error.js";
import {
    generateInvoiceParamsSchema,
    getInvoicesParamsSchema,
    payInvoiceParamsSchema,
    sendInvoiceParamsSchema,
} from "./invoice.schema.js";

const invoiceController = {
    async generateInvoice(request: Request, response: Response) {
        try {
            const projectId = request.project!.id;
            const validatedParams = generateInvoiceParamsSchema.safeParse(request.params);
            if (!validatedParams.success) throw new ValidationError("Invalid Phase ID format");

            const result = await invoiceService.generateInvoice(projectId, validatedParams.data.phaseId);
            return response.status(201).json(result);
        } catch (error) {
            console.log(error)
            if (error instanceof ValidationError) return response.status(400).json({ message: error.message });
            logger.error(error);
            return response.status(500).json({ message: "Internal server error" });
        }
    },

    async getInvoices(request: Request, response: Response) {
        try {
            const projectId = request.project!.id;
            const validatedParams = getInvoicesParamsSchema.safeParse(request.params);
            if (!validatedParams.success) throw new ValidationError("Invalid Phase ID format");

            const result = await invoiceService.getInvoices(projectId, validatedParams.data.phaseId);
            return response.status(200).json(result);
        } catch (error) {
            console.log(error)
            if (error instanceof ValidationError) return response.status(400).json({ message: error.message });
            logger.error(error);
            return response.status(500).json({ message: "Internal server error" });
        }
    },

    async payInvoice(request: Request, response: Response) {
        try {
            const projectId = request.project!.id;
            const validatedParams = payInvoiceParamsSchema.safeParse(request.params);
            if (!validatedParams.success) throw new ValidationError("Invalid Invoice ID format");

            const result = await invoiceService.payInvoice(projectId, validatedParams.data.invoiceId);
            return response.status(200).json(result);
        } catch (error) {
            console.log(error)
            if (error instanceof ValidationError) return response.status(400).json({ message: error.message });
            logger.error(error);
            return response.status(500).json({ message: "Internal server error" });
        }
    },

    async sendInvoice(request: Request, response: Response) {
        try {
            const projectId = request.project!.id;
            const validatedParams = sendInvoiceParamsSchema.safeParse(request.params);
            if (!validatedParams.success) throw new ValidationError("Invalid Invoice ID format");

            await invoiceService.sendInvoiceEmail(projectId, validatedParams.data.invoiceId);
            return response.status(200).json({ message: "Invoice emailed to client successfully." });
        } catch (error) {
            console.log(error)
            if (error instanceof ValidationError) return response.status(400).json({ message: error.message });
            logger.error(error);
            return response.status(500).json({ message: "Internal server error" });
        }
    },
};

export default invoiceController;
