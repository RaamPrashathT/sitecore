import type { Request, Response } from "express";
import { logger } from "../../../shared/lib/logger.js";
import { ValidationError } from "../../../shared/error/validation.error.js";
import { MissingError } from "../../../shared/error/missing.error.js";
import { ConflictError } from "../../../shared/error/conflict.error.js";
import supplierQuotesService from "./supplierQuotes.service.js";
import {
    getSupplierQuotesQuerySchema,
    quoteIdParamSchema,
    catalogueIdParamSchema,
    supplierIdParamSchema,
    createSupplierQuoteBodySchema,
    editSupplierQuoteBodySchema,
} from "./supplierQuotes.schema.js";

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
    logger.error("Unexpected error in supplierQuotes controller", {
        organizationId: orgId,
        resourceId,
        error: error instanceof Error ? error.stack : String(error),
    });
    return response.status(500).json({ success: false, message: "Internal server error" });
}

const supplierQuotesController = {
    async getSupplierQuotes(request: Request, response: Response) {
        try {
            console.log("==============================")
            const parsed = getSupplierQuotesQuerySchema.safeParse(request.query);
            if (!parsed.success) {
                throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid query parameters");
            }

            const orgId = request.tenant?.orgId;
            if (!orgId) throw new ValidationError("Organization context missing");
            console.log(parsed.data)
            const { index, size, catalogueId, supplierId } = parsed.data;
            const result = await supplierQuotesService.getSupplierQuotes(
                orgId,
                index,
                size,
                catalogueId,
                supplierId,
            );

            return response.status(200).json({
                success: true,
                message: "Supplier quotes fetched successfully",
                data: result.data,
                count: result.count,
                pageIndex: index,
                pageSize: size,
            });
        } catch (error) {
            return handleError(error, request.tenant?.orgId, undefined, response);
        }
    },

    async getSupplierQuoteById(request: Request, response: Response) {
        try {
            const parsed = quoteIdParamSchema.safeParse(request.params);
            if (!parsed.success) {
                throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid parameters");
            }

            const orgId = request.tenant?.orgId;
            if (!orgId) throw new ValidationError("Organization context missing");

            const data = await supplierQuotesService.getSupplierQuoteById(orgId, parsed.data.quoteId);

            return response.status(200).json({
                success: true,
                message: "Supplier quote fetched successfully",
                data,
            });
        } catch (error) {
            return handleError(error, request.tenant?.orgId, request.params["quoteId"] as string, response);
        }
    },

    async createSupplierQuote(request: Request, response: Response) {
        try {
            const parsed = createSupplierQuoteBodySchema.safeParse(request.body);
            if (!parsed.success) {
                throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid request body");
            }

            const orgId = request.tenant?.orgId;
            if (!orgId) throw new ValidationError("Organization context missing");

            const data = await supplierQuotesService.createSupplierQuote(orgId, parsed.data);

            return response.status(201).json({
                success: true,
                message: "Supplier quote created successfully",
                data,
            });
        } catch (error) {
            return handleError(error, request.tenant?.orgId, undefined, response);
        }
    },

    async editSupplierQuote(request: Request, response: Response) {
        try {
            const paramsParsed = quoteIdParamSchema.safeParse(request.params);
            if (!paramsParsed.success) {
                throw new ValidationError(paramsParsed.error.issues[0]?.message ?? "Invalid parameters");
            }

            const bodyParsed = editSupplierQuoteBodySchema.safeParse(request.body);
            if (!bodyParsed.success) {
                throw new ValidationError(bodyParsed.error.issues[0]?.message ?? "Invalid request body");
            }

            const orgId = request.tenant?.orgId;
            if (!orgId) throw new ValidationError("Organization context missing");

            const changedByMemberId = request.session?.userId;

            const data = await supplierQuotesService.editSupplierQuote(
                orgId,
                paramsParsed.data.quoteId,
                bodyParsed.data,
                changedByMemberId,
            );

            return response.status(200).json({
                success: true,
                message: "Supplier quote updated successfully",
                data,
            });
        } catch (error) {
            return handleError(error, request.tenant?.orgId, request.params["quoteId"] as string, response);
        }
    },

    async deleteSupplierQuote(request: Request, response: Response) {
        try {
            const parsed = quoteIdParamSchema.safeParse(request.params);
            if (!parsed.success) {
                throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid parameters");
            }

            const orgId = request.tenant?.orgId;
            if (!orgId) throw new ValidationError("Organization context missing");

            await supplierQuotesService.deleteSupplierQuote(orgId, parsed.data.quoteId);

            return response.status(200).json({
                success: true,
                message: "Supplier quote deleted successfully",
            });
        } catch (error) {
            return handleError(error, request.tenant?.orgId, request.params["quoteId"] as string, response);
        }
    },

    async getQuotesByCatalogueId(request: Request, response: Response) {
        try {
            const parsed = catalogueIdParamSchema.safeParse(request.params);
            if (!parsed.success) {
                throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid parameters");
            }

            const orgId = request.tenant?.orgId;
            if (!orgId) throw new ValidationError("Organization context missing");

            const result = await supplierQuotesService.getQuotesByCatalogueId(orgId, parsed.data.catalogueId);

            return response.status(200).json({
                success: true,
                message: "Supplier quotes fetched successfully",
                data: result.data,
                count: result.count,
            });
        } catch (error) {
            return handleError(error, request.tenant?.orgId, request.params["catalogueId"] as string, response);
        }
    },

    async getQuotesBySupplierId(request: Request, response: Response) {
        try {
            const parsed = supplierIdParamSchema.safeParse(request.params);
            if (!parsed.success) {
                throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid parameters");
            }

            const orgId = request.tenant?.orgId;
            if (!orgId) throw new ValidationError("Organization context missing");

            const result = await supplierQuotesService.getQuotesBySupplierId(orgId, parsed.data.supplierId);

            return response.status(200).json({
                success: true,
                message: "Supplier quotes fetched successfully",
                data: result.data,
                count: result.count,
            });
        } catch (error) {
            return handleError(error, request.tenant?.orgId, request.params["supplierId"] as string, response);
        }
    },
};

export default supplierQuotesController;
