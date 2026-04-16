import type { Request, Response } from "express";
import { logger } from "../../../shared/lib/logger.js";
import { ValidationError } from "../../../shared/error/validation.error.js";
import { MissingError } from "../../../shared/error/missing.error.js";
import { ConflictError } from "../../../shared/error/conflict.error.js";
import inventoryStocksService from "./inventoryStocks.service.js";
import {
    getInventoryStocksQuerySchema,
    stockIdParamSchema,
    catalogueIdParamSchema,
    getCatalogueStocksQuerySchema,
} from "./inventoryStocks.schema.js";

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
    logger.error("Unexpected error in inventoryStocks controller", {
        organizationId: orgId,
        resourceId,
        error: error instanceof Error ? error.stack : String(error),
    });
    return response.status(500).json({ success: false, message: "Internal server error" });
}

const inventoryStocksController = {
    async getInventoryStocks(request: Request, response: Response) {
        try {
            const parsed = getInventoryStocksQuerySchema.safeParse(request.query);
            if (!parsed.success) {
                throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid query parameters");
            }

            const orgId = request.tenant?.orgId;
            if (!orgId) throw new ValidationError("Organization context missing");

            const { index, size, search, locationId, catalogueId, locationType } = parsed.data;
            const result = await inventoryStocksService.getInventoryStocks(
                orgId,
                index,
                size,
                search,
                locationId,
                catalogueId,
                locationType,
            );

            return response.status(200).json({
                success: true,
                message: "Inventory stocks fetched successfully",
                data: result.data,
                count: result.count,
                pageIndex: index,
                pageSize: size,
            });
        } catch (error) {
            return handleError(error, request.tenant?.orgId, undefined, response);
        }
    },

    async getInventoryStockById(request: Request, response: Response) {
        try {
            const parsed = stockIdParamSchema.safeParse(request.params);
            if (!parsed.success) {
                throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid parameters");
            }

            const orgId = request.tenant?.orgId;
            if (!orgId) throw new ValidationError("Organization context missing");

            const data = await inventoryStocksService.getInventoryStockById(orgId, parsed.data.stockId);

            return response.status(200).json({
                success: true,
                message: "Inventory stock fetched successfully",
                data,
            });
        } catch (error) {
            return handleError(error, request.tenant?.orgId, request.params["stockId"] as string, response);
        }
    },

    async getStocksByCatalogueId(request: Request, response: Response) {
        try {
            const paramsParsed = catalogueIdParamSchema.safeParse(request.params);
            if (!paramsParsed.success) {
                throw new ValidationError(paramsParsed.error.issues[0]?.message ?? "Invalid parameters");
            }

            const queryParsed = getCatalogueStocksQuerySchema.safeParse(request.query);
            if (!queryParsed.success) {
                throw new ValidationError(queryParsed.error.issues[0]?.message ?? "Invalid query parameters");
            }

            const orgId = request.tenant?.orgId;
            if (!orgId) throw new ValidationError("Organization context missing");

            const { index, size, search, locationType } = queryParsed.data;
            const result = await inventoryStocksService.getStocksByCatalogueId(
                orgId,
                paramsParsed.data.catalogueId,
                index,
                size,
                search,
                locationType,
            );

            return response.status(200).json({
                success: true,
                message: "Inventory stocks fetched successfully",
                data: result.data,
                count: result.count,
                pageIndex: index,
                pageSize: size,
            });
        } catch (error) {
            return handleError(error, request.tenant?.orgId, request.params["catalogueId"] as string, response);
        }
    },
};

export default inventoryStocksController;
