import type { Request, Response } from "express";
import {
    getDashboardItemsSchema,
    orderItemSchema,
} from "./dashboard.schema.js";
import { logger } from "../../shared/lib/logger.js";
import { ValidationError } from "../../shared/error/validation.error.js";
import dashboardService from "./dashboard.service.js";

const dashboardController = {
    async getDashboardItems(request: Request, response: Response) {
        try {
            const organizationId = request.tenant?.orgId;
            const searchQuery = (request.query.search as string) || "";

            const validatedData = getDashboardItemsSchema.safeParse({
                organizationId,
                searchQuery,
            });

            if (!validatedData.success)
                throw new ValidationError("Invalid Request");

            const result = await dashboardService.getDashboardItems(
                validatedData.data.organizationId,
                validatedData.data.searchQuery,
            );

            return response.status(200).json(result);
        } catch (error) {
            if (error instanceof ValidationError)
                return response.status(400).json({ message: error.message });
            logger.error(error);
            return response
                .status(500)
                .json({ message: "Something went wrong" });
        }
    },

    async orderItem(request: Request, response: Response) {
        try {
            const validatedData = orderItemSchema.safeParse({
                requisitionItemId: request.body.requisitionItemId,
                deductInventoryQty: request.body.deductInventoryQty,
                organizationId: request.tenant?.orgId,
            });

            if (!validatedData.success) {
                throw new ValidationError("Invalid Order Data");
            }

            const result = await dashboardService.orderItem(validatedData.data);
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

    async getEngineerDashboardItems(request: Request, response: Response) {
        try {
            const organizationId = request.tenant?.orgId;
            const engineerId = request.session?.userId;
            const searchQuery = (request.query.search as string) || "";

            const validatedData = getDashboardItemsSchema.safeParse({
                organizationId,
                searchQuery,
            });

            if (!validatedData.success)
                throw new ValidationError("Invalid Request");

            const result = await dashboardService.getEngineerDashboardItems(
                engineerId!,
                validatedData.data.organizationId,
                validatedData.data.searchQuery,
            );

            return response.status(200).json(result);
        } catch (error) {
            if (error instanceof ValidationError)
                return response.status(400).json({ message: error.message });
            logger.error(error);
            return response
                .status(500)
                .json({ message: "Something went wrong" });
        }
    },

    async getClientDashboardItems(request: Request, response: Response) {
        try {
            const organizationId = request.tenant?.orgId;
            const clientId = request.session?.userId;
            const searchQuery = (request.query.search as string) || "";

            const validatedData = getDashboardItemsSchema.safeParse({
                organizationId,
                searchQuery,
            });

            if (!validatedData.success)
                throw new ValidationError("Invalid Request");

            const result = await dashboardService.getClientDashboardItems(
                clientId!,
                validatedData.data.organizationId,
                validatedData.data.searchQuery,
            );

            return response.status(200).json(result);
        } catch (error) {
            if (error instanceof ValidationError)
                return response.status(400).json({ message: error.message });
            logger.error(error);
            return response
                .status(500)
                .json({ message: "Something went wrong" });
        }
    },

    async getPendingApprovalsSummary(request: Request, response: Response) {
        try {
            const organizationId = request.tenant?.orgId;
            if (!organizationId)
                throw new ValidationError("Organization ID required");

            const result =
                await dashboardService.getPendingApprovalsSummary(
                    organizationId,
                );
            return response.status(200).json(result);
        } catch (error) {
            logger.error(error);
            return response
                .status(500)
                .json({ message: "Failed to fetch pending approvals" });
        }
    },
    async getRequisitionBySlug(request: Request, response: Response) {
        try {
            const organizationId = request.tenant?.orgId;
            const reqSlug = request.params.reqSlug as string;

            if (!organizationId) {
                return response.status(401).json({ message: "Unauthorized" });
            }

            const result = await dashboardService.getRequisitionBySlug(
                organizationId,
                reqSlug,
            );
            return response.status(200).json(result);
        } catch (error: any) {
            if (error.message === "Requisition not found") {
                return response.status(404).json({ message: error.message });
            }
            logger.error(error);
            return response
                .status(500)
                .json({ message: "Internal server error" });
        }
    },

    async getPendingPaymentById(request: Request, response: Response) {
        try {
            const organizationId = request.tenant?.orgId;
            const phaseId = request.params.phaseId as string;

            if (!organizationId) {
                return response.status(401).json({ message: "Unauthorized" });
            }

            const result = await dashboardService.getPendingPaymentById(
                organizationId,
                phaseId,
            );
            return response.status(200).json(result);
        } catch (error: any) {
            if (error.message === "Payment not found") {
                return response.status(404).json({ message: error.message });
            }
            logger.error(error);
            return response.status(500).json({ message: "Internal server error" });
        }
    },

    async approvePendingPayment(request: Request, response: Response) {
        try {
            const organizationId = request.tenant?.orgId;
            const phaseId = request.body.id;

            if (!organizationId) {
                return response.status(401).json({ message: "Unauthorized" });
            }

            const result = await dashboardService.approvePendingPayment(
                organizationId,
                phaseId,
            );
            return response.status(200).json(result);
        } catch (error: any) {
            logger.error(error);
            return response
                .status(500)
                .json({ message: "Internal server error" });
        }
    },
};

export default dashboardController;
