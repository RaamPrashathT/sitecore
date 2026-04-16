import type { Request, Response } from "express";
import { logger } from "../../../shared/lib/logger.js";
import { ValidationError } from "../../../shared/error/validation.error.js";
import { MissingError } from "../../../shared/error/missing.error.js";
import { ConflictError } from "../../../shared/error/conflict.error.js";
import suppliersService from "./suppliers.service.js";
import {
    getSuppliersQuerySchema,
    supplierIdParamSchema,
    createSupplierBodySchema,
    editSupplierBodySchema,
} from "./suppliers.schema.js";

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
    logger.error("Unexpected error in suppliers controller", {
        organizationId: orgId,
        resourceId,
        error: error instanceof Error ? error.stack : String(error),
    });
    return response.status(500).json({ success: false, message: "Internal server error" });
}

const suppliersController = {
    async getSuppliers(request: Request, response: Response) {
        try {
            const parsed = getSuppliersQuerySchema.safeParse(request.query);
            if (!parsed.success) {
                throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid query parameters");
            }

            const orgId = request.tenant?.orgId;
            if (!orgId) throw new ValidationError("Organization context missing");

            const { index, size, search, includeDeleted } = parsed.data;
            const result = await suppliersService.getSuppliers(orgId, index, size, search, includeDeleted);

            return response.status(200).json({
                success: true,
                message: "Suppliers fetched successfully",
                data: result.data,
                count: result.count,
                pageIndex: index,
                pageSize: size,
            });
        } catch (error) {
            return handleError(error, request.tenant?.orgId, undefined, response);
        }
    },

    async getSupplierById(request: Request, response: Response) {
        try {
            const parsed = supplierIdParamSchema.safeParse(request.params);
            if (!parsed.success) {
                throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid parameters");
            }

            const orgId = request.tenant?.orgId;
            if (!orgId) throw new ValidationError("Organization context missing");

            const data = await suppliersService.getSupplierById(orgId, parsed.data.supplierId);

            return response.status(200).json({
                success: true,
                message: "Supplier fetched successfully",
                data,
            });
        } catch (error) {
            return handleError(error, request.tenant?.orgId, request.params["supplierId"] as string, response);
        }
    },

    async createSupplier(request: Request, response: Response) {
        try {
            const parsed = createSupplierBodySchema.safeParse(request.body);
            if (!parsed.success) {
                throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid request body");
            }

            const orgId = request.tenant?.orgId;
            if (!orgId) throw new ValidationError("Organization context missing");

            const data = await suppliersService.createSupplier(orgId, parsed.data);

            return response.status(201).json({
                success: true,
                message: "Supplier created successfully",
                data,
            });
        } catch (error) {
            return handleError(error, request.tenant?.orgId, undefined, response);
        }
    },

    async editSupplier(request: Request, response: Response) {
        try {
            const paramsParsed = supplierIdParamSchema.safeParse(request.params);
            if (!paramsParsed.success) {
                throw new ValidationError(paramsParsed.error.issues[0]?.message ?? "Invalid parameters");
            }

            const bodyParsed = editSupplierBodySchema.safeParse(request.body);
            if (!bodyParsed.success) {
                throw new ValidationError(bodyParsed.error.issues[0]?.message ?? "Invalid request body");
            }

            const orgId = request.tenant?.orgId;
            if (!orgId) throw new ValidationError("Organization context missing");

            const data = await suppliersService.editSupplier(orgId, paramsParsed.data.supplierId, bodyParsed.data);

            return response.status(200).json({
                success: true,
                message: "Supplier updated successfully",
                data,
            });
        } catch (error) {
            return handleError(error, request.tenant?.orgId, request.params["supplierId"] as string, response);
        }
    },

    async deleteSupplier(request: Request, response: Response) {
        try {
            const parsed = supplierIdParamSchema.safeParse(request.params);
            if (!parsed.success) {
                throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid parameters");
            }

            const orgId = request.tenant?.orgId;
            if (!orgId) throw new ValidationError("Organization context missing");

            await suppliersService.archiveSupplier(orgId, parsed.data.supplierId);

            return response.status(200).json({
                success: true,
                message: "Supplier archived successfully",
            });
        } catch (error) {
            return handleError(error, request.tenant?.orgId, request.params["supplierId"] as string, response);
        }
    },

    async restoreSupplier(request: Request, response: Response) {
        try {
            const parsed = supplierIdParamSchema.safeParse(request.params);
            if (!parsed.success) {
                throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid parameters");
            }

            const orgId = request.tenant?.orgId;
            if (!orgId) throw new ValidationError("Organization context missing");

            const data = await suppliersService.restoreSupplier(orgId, parsed.data.supplierId);

            return response.status(200).json({
                success: true,
                message: "Supplier restored successfully",
                data,
            });
        } catch (error) {
            return handleError(error, request.tenant?.orgId, request.params["supplierId"] as string, response);
        }
    },

    async getSuppliersByCatalogueId(request: Request, response: Response) {
        try {
            const parsed = request.params["catalogueId"];
            if (!parsed || typeof parsed !== "string") {
                throw new ValidationError("catalogueId is required");
            }

            const orgId = request.tenant?.orgId;
            if (!orgId) throw new ValidationError("Organization context missing");

            const result = await suppliersService.getSuppliersByCatalogueId(orgId, parsed);

            return response.status(200).json({
                success: true,
                message: "Suppliers fetched successfully",
                data: result.data,
                count: result.count,
            });
        } catch (error) {
            return handleError(error, request.tenant?.orgId, request.params["catalogueId"] as string, response);
        }
    },

    async getCatalogueItemsBySupplierId(request: Request, response: Response) {
        try {
            const parsed = supplierIdParamSchema.safeParse(request.params);
            if (!parsed.success) {
                throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid parameters");
            }

            const orgId = request.tenant?.orgId;
            if (!orgId) throw new ValidationError("Organization context missing");

            const result = await suppliersService.getCatalogueItemsBySupplierId(orgId, parsed.data.supplierId);

            return response.status(200).json({
                success: true,
                message: "Catalogue items fetched successfully",
                data: result.data,
                count: result.count,
            });
        } catch (error) {
            return handleError(error, request.tenant?.orgId, request.params["supplierId"] as string, response);
        }
    },
};

export default suppliersController;
