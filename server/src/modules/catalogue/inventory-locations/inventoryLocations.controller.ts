import type { Request, Response } from "express";
import { logger } from "../../../shared/lib/logger.js";
import { ValidationError } from "../../../shared/error/validation.error.js";
import { MissingError } from "../../../shared/error/missing.error.js";
import { ConflictError } from "../../../shared/error/conflict.error.js";
import inventoryLocationsService from "./inventoryLocations.service.js";
import {
    getInventoryLocationsQuerySchema,
    locationIdParamSchema,
    createInventoryLocationBodySchema,
    editInventoryLocationBodySchema,
    locationStocksQuerySchema,
    locationMovementsQuerySchema,
} from "./inventoryLocations.schema.js";

function handleError(
    error: unknown,
    orgId: string | undefined,
    resourceId: string | undefined,
    response: Response,
) {
    if (error instanceof ValidationError) {
        return response.status(400).json({ success: false, message: error.message });
    }
    if (error instanceof MissingError) {
        return response.status(404).json({ success: false, message: error.message });
    }
    if (error instanceof ConflictError) {
        return response.status(409).json({ success: false, message: error.message });
    }
    logger.error("Unexpected error in inventoryLocations controller", {
        organizationId: orgId,
        resourceId,
        error: error instanceof Error ? error.stack : String(error),
    });
    return response.status(500).json({ success: false, message: "Internal server error" });
}

const inventoryLocationsController = {
    async getInventoryLocations(request: Request, response: Response) {
        try {
            const parsed = getInventoryLocationsQuerySchema.safeParse(request.query);
            if (!parsed.success) {
                throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid query parameters");
            }

            const orgId = request.tenant?.orgId;
            if (!orgId) throw new ValidationError("Organization context missing");

            const { index, size, search, includeDeleted, includeInactive, type, projectId } = parsed.data;
            const result = await inventoryLocationsService.getInventoryLocations(orgId, {
                pageIndex: index,
                pageSize: size,
                search,
                includeDeleted,
                includeInactive,
                ...(type !== undefined && { type }),
                ...(projectId !== undefined && { projectId }),
            });

            return response.status(200).json({
                success: true,
                message: "Inventory locations fetched successfully",
                data: result.data,
                count: result.count,
                pageIndex: index,
                pageSize: size,
            });
        } catch (error) {
            return handleError(error, request.tenant?.orgId, undefined, response);
        }
    },

    async getInventoryLocationById(request: Request, response: Response) {
        try {
            const parsed = locationIdParamSchema.safeParse(request.params);
            if (!parsed.success) {
                throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid parameters");
            }

            const orgId = request.tenant?.orgId;
            if (!orgId) throw new ValidationError("Organization context missing");

            const data = await inventoryLocationsService.getInventoryLocationById(
                orgId, parsed.data.locationId,
            );

            return response.status(200).json({
                success: true,
                message: "Inventory location fetched successfully",
                data,
            });
        } catch (error) {
            return handleError(error, request.tenant?.orgId, request.params["locationId"] as string, response);
        }
    },

    async createInventoryLocation(request: Request, response: Response) {
        try {
            const parsed = createInventoryLocationBodySchema.safeParse(request.body);
            if (!parsed.success) {
                throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid request body");
            }

            const orgId = request.tenant?.orgId;
            if (!orgId) throw new ValidationError("Organization context missing");

            const data = await inventoryLocationsService.createInventoryLocation(orgId, parsed.data);

            return response.status(201).json({
                success: true,
                message: "Inventory location created successfully",
                data,
            });
        } catch (error) {
            return handleError(error, request.tenant?.orgId, undefined, response);
        }
    },

    async editInventoryLocation(request: Request, response: Response) {
        try {
            const paramsParsed = locationIdParamSchema.safeParse(request.params);
            if (!paramsParsed.success) {
                throw new ValidationError(paramsParsed.error.issues[0]?.message ?? "Invalid parameters");
            }

            const bodyParsed = editInventoryLocationBodySchema.safeParse(request.body);
            if (!bodyParsed.success) {
                throw new ValidationError(bodyParsed.error.issues[0]?.message ?? "Invalid request body");
            }

            const orgId = request.tenant?.orgId;
            if (!orgId) throw new ValidationError("Organization context missing");

            const data = await inventoryLocationsService.editInventoryLocation(
                orgId, paramsParsed.data.locationId, bodyParsed.data,
            );

            return response.status(200).json({
                success: true,
                message: "Inventory location updated successfully",
                data,
            });
        } catch (error) {
            return handleError(error, request.tenant?.orgId, request.params["locationId"] as string, response);
        }
    },

    async deleteInventoryLocation(request: Request, response: Response) {
        try {
            const parsed = locationIdParamSchema.safeParse(request.params);
            if (!parsed.success) {
                throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid parameters");
            }

            const orgId = request.tenant?.orgId;
            if (!orgId) throw new ValidationError("Organization context missing");

            await inventoryLocationsService.deleteInventoryLocation(orgId, parsed.data.locationId);

            return response.status(200).json({
                success: true,
                message: "Inventory location deleted successfully",
            });
        } catch (error) {
            return handleError(error, request.tenant?.orgId, request.params["locationId"] as string, response);
        }
    },

    async getStocksByLocationId(request: Request, response: Response) {
        try {
            const paramsParsed = locationIdParamSchema.safeParse(request.params);
            if (!paramsParsed.success) {
                throw new ValidationError(paramsParsed.error.issues[0]?.message ?? "Invalid parameters");
            }

            const queryParsed = locationStocksQuerySchema.safeParse(request.query);
            if (!queryParsed.success) {
                throw new ValidationError(queryParsed.error.issues[0]?.message ?? "Invalid query parameters");
            }

            const orgId = request.tenant?.orgId;
            if (!orgId) throw new ValidationError("Organization context missing");

            const { index, size, search } = queryParsed.data;
            const result = await inventoryLocationsService.getStocksByLocationId(
                orgId, paramsParsed.data.locationId, index, size, search,
            );

            return response.status(200).json({
                success: true,
                message: "Stocks fetched successfully",
                data: result.data,
                count: result.count,
                pageIndex: index,
                pageSize: size,
            });
        } catch (error) {
            return handleError(error, request.tenant?.orgId, request.params["locationId"] as string, response);
        }
    },

    async getMovementsByLocationId(request: Request, response: Response) {
        try {
            const paramsParsed = locationIdParamSchema.safeParse(request.params);
            if (!paramsParsed.success) {
                throw new ValidationError(paramsParsed.error.issues[0]?.message ?? "Invalid parameters");
            }

            const queryParsed = locationMovementsQuerySchema.safeParse(request.query);
            if (!queryParsed.success) {
                throw new ValidationError(queryParsed.error.issues[0]?.message ?? "Invalid query parameters");
            }

            const orgId = request.tenant?.orgId;
            if (!orgId) throw new ValidationError("Organization context missing");

            const { index, size, search, type } = queryParsed.data;
            const result = await inventoryLocationsService.getMovementsByLocationId(
                orgId, paramsParsed.data.locationId, index, size, search, type,
            );

            return response.status(200).json({
                success: true,
                message: "Movements fetched successfully",
                data: result.data,
                count: result.count,
                pageIndex: index,
                pageSize: size,
            });
        } catch (error) {
            return handleError(error, request.tenant?.orgId, request.params["locationId"] as string, response);
        }
    },
};

export default inventoryLocationsController;
