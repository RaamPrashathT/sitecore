import type { Request, Response } from "express";
import { logger } from "../../../shared/lib/logger.js";
import { ValidationError } from "../../../shared/error/validation.error.js";
import { MissingError } from "../../../shared/error/missing.error.js";
import { ConflictError } from "../../../shared/error/conflict.error.js";
import inventoryMovementsService from "./inventoryMovements.service.js";
import {
    getInventoryMovementsQuerySchema,
    movementIdParamSchema,
    createReceiptBodySchema,
    createIssueBodySchema,
    createTransferBodySchema,
    createAdjustmentBodySchema,
} from "./inventoryMovements.schema.js";

function handleError(
    error: unknown,
    orgId: string | undefined,
    resourceId: string | undefined,
    response: Response,
) {
    console.log(error)
    if (error instanceof ValidationError) {
        return response.status(400).json({ success: false, message: error.message });
    }
    if (error instanceof MissingError) {
        return response.status(404).json({ success: false, message: error.message });
    }
    if (error instanceof ConflictError) {
        return response.status(409).json({ success: false, message: error.message });
    }
    logger.error("Unexpected error in inventoryMovements controller", {
        organizationId: orgId,
        resourceId,
        error: error instanceof Error ? error.stack : String(error),
    });
    return response.status(500).json({ success: false, message: "Internal server error" });
}

const inventoryMovementsController = {
    async getInventoryMovements(request: Request, response: Response) {
        try {
            const parsed = getInventoryMovementsQuerySchema.safeParse(request.query);
            if (!parsed.success) {
                throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid query parameters");
            }

            const orgId = request.tenant?.orgId;
            if (!orgId) throw new ValidationError("Organization context missing");

            const { index, size, catalogueId, locationId, type, search } = parsed.data;
            const result = await inventoryMovementsService.getInventoryMovements(
                orgId, index, size, catalogueId, locationId, type, search,
            );

            return response.status(200).json({
                success: true,
                message: "Inventory movements fetched successfully",
                data: result.data,
                count: result.count,
                pageIndex: index,
                pageSize: size,
            });
        } catch (error) {
            return handleError(error, request.tenant?.orgId, undefined, response);
        }
    },

    async getInventoryMovementById(request: Request, response: Response) {
        try {
            const parsed = movementIdParamSchema.safeParse(request.params);
            if (!parsed.success) {
                throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid parameters");
            }

            const orgId = request.tenant?.orgId;
            if (!orgId) throw new ValidationError("Organization context missing");

            const data = await inventoryMovementsService.getInventoryMovementById(
                orgId, parsed.data.movementId,
            );

            return response.status(200).json({
                success: true,
                message: "Inventory movement fetched successfully",
                data,
            });
        } catch (error) {
            return handleError(error, request.tenant?.orgId, request.params["movementId"] as string, response);
        }
    },

    async createReceipt(request: Request, response: Response) {
        try {
            const parsed = createReceiptBodySchema.safeParse(request.body);
            if (!parsed.success) {
                throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid request body");
            }

            const orgId = request.tenant?.orgId;
            const userId = request.session?.userId;
            if (!orgId || !userId) throw new ValidationError("Organization context missing");

            const data = await inventoryMovementsService.createReceipt(
                orgId, userId, parsed.data,
            );

            return response.status(201).json({
                success: true,
                message: "Receipt recorded successfully",
                data,
            });
        } catch (error) {
            return handleError(error, request.tenant?.orgId, undefined, response);
        }
    },

    async createIssue(request: Request, response: Response) {
        try {
            const parsed = createIssueBodySchema.safeParse(request.body);
            if (!parsed.success) {
                throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid request body");
            }

            const orgId = request.tenant?.orgId;
            const userId = request.session?.userId;
            if (!orgId || !userId) throw new ValidationError("Organization context missing");

            const data = await inventoryMovementsService.createIssue(
                orgId, userId, parsed.data,
            );

            return response.status(201).json({
                success: true,
                message: "Issue recorded successfully",
                data,
            });
        } catch (error) {
            return handleError(error, request.tenant?.orgId, undefined, response);
        }
    },

    async createTransfer(request: Request, response: Response) {
        try {
            const parsed = createTransferBodySchema.safeParse(request.body);
            if (!parsed.success) {
                throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid request body");
            }

            const orgId = request.tenant?.orgId;
            const userId = request.session?.userId
            if (!orgId || !userId) throw new ValidationError("Organization context missing");

            const data = await inventoryMovementsService.createTransfer(
                orgId, userId , parsed.data,
            );

            return response.status(201).json({
                success: true,
                message: "Transfer recorded successfully",
                data,
            });
        } catch (error) {
            return handleError(error, request.tenant?.orgId, undefined, response);
        }
    },

    async createAdjustment(request: Request, response: Response) {
        try {
            const parsed = createAdjustmentBodySchema.safeParse(request.body);
            if (!parsed.success) {
                throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid request body");
            }

            const orgId = request.tenant?.orgId;
            if (!orgId) throw new ValidationError("Organization context missing");

            const data = await inventoryMovementsService.createAdjustment(
                orgId, request.session?.userId, parsed.data,
            );

            return response.status(201).json({
                success: true,
                message: "Adjustment recorded successfully",
                data,
            });
        } catch (error) {
            return handleError(error, request.tenant?.orgId, undefined, response);
        }
    },
};

export default inventoryMovementsController;
