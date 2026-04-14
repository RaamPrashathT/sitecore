import type { Request, Response } from "express";
import { logger } from "../../shared/lib/logger.js";
import { UnAuthorizedError } from "../../shared/error/unauthorized.error.js";
import { ValidationError } from "../../shared/error/validation.error.js";
import { MissingError } from "../../shared/error/missing.error.js";
import catalogueService from "./catalogue.service.js";
import {
    deleteFormSchema,
    editFormSchema,
    formSchema,
    getCatalogueByIdSchema,
    getCatalogueSchema,
    createSupplierSchema,
    editSupplierSchema,
    deleteSupplierSchema,
    createSupplierQuoteSchema,
    editSupplierQuoteSchema,
    deleteSupplierQuoteSchema,
    createInventoryLocationSchema,
    editInventoryLocationSchema,
    deleteInventoryLocationSchema,
    receiveMaterialSchema,
    consumeMaterialSchema,
    adjustMaterialSchema,
    getInventoryTransactionsSchema,
} from "./catalogue.schema.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function handleError(error: unknown, response: Response) {
    if (error instanceof UnAuthorizedError) {
        return response.status(401).json({ success: false, message: error.message });
    }
    if (error instanceof ValidationError) {
        return response.status(400).json({ success: false, message: error.message });
    }
    if (error instanceof MissingError) {
        return response.status(404).json({ success: false, message: error.message });
    }
    logger.error(error);
    return response.status(500).json({ success: false, message: "Internal server error" });
}

function requireAdmin(request: Request) {
    if (request.tenant?.role !== "ADMIN") throw new UnAuthorizedError("Unauthorized");
}

function requireOrgId(request: Request): string {
    const orgId = request.tenant?.orgId;
    if (!orgId) throw new UnAuthorizedError("Unauthorized");
    return orgId;
}

// ─── Membership lookup helper ─────────────────────────────────────────────────
// We need the Membership.id (PK) for InventoryTransaction.recordedById.
// The session gives us userId; we resolve the membership from DB.
import { prisma } from "../../shared/lib/prisma.js";

async function resolveMembershipId(userId: string, orgId: string): Promise<string> {
    const membership = await prisma.membership.findUnique({
        where: { userId_organizationId: { userId, organizationId: orgId } },
    });
    if (!membership) throw new UnAuthorizedError("Membership not found");
    return membership.id;
}

// ─── Catalogue Controllers ────────────────────────────────────────────────────

const catalogueController = {
    async getCatalogue(request: Request, response: Response) {
        try {
            const organizationId = requireOrgId(request);
            const index = Number.parseInt(request.query.index as string) || 0;
            const size = Number.parseInt(request.query.size as string) || 10;
            const searchQuery = (request.query.search as string) || "";

            const validatedData = getCatalogueSchema.safeParse({
                organizationId,
                pageIndex: index,
                pageSize: size,
                searchQuery,
            });
            if (!validatedData.success) throw new ValidationError("Invalid Request Parameters");

            const result = await catalogueService.getCatalogue(
                validatedData.data.organizationId,
                validatedData.data.pageIndex,
                validatedData.data.pageSize,
                validatedData.data.searchQuery,
            );
            logger.info(`Catalogue fetched successfully for organization ${organizationId}`);
            return response.status(200).json(result);
        } catch (error) {
            return handleError(error, response);
        }
    },

    async getCatalogueById(request: Request, response: Response) {
        try {
            const organizationId = requireOrgId(request);
            const catalogueId = request.params.catalogueId;

            const validatedData = getCatalogueByIdSchema.safeParse({ catalogueId });
            if (!validatedData.success) throw new ValidationError("Invalid Request Parameters");

            const result = await catalogueService.getCatalogueById(
                validatedData.data.catalogueId,
                organizationId,
            );
            logger.info(`Catalogue fetched successfully for organization ${organizationId}`);
            return response.status(200).json(result);
        } catch (error) {
            return handleError(error, response);
        }
    },

    async createCatalogue(request: Request, response: Response) {
        try {
            requireAdmin(request);
            const orgId = requireOrgId(request);

            const validatedData = formSchema.safeParse(request.body);
            if (!validatedData.success) throw new ValidationError("Invalid Entries");

            await catalogueService.createCatalogue(validatedData.data, orgId);
            return response.status(201).json({ success: true, message: "Catalogue created successfully" });
        } catch (error) {
            return handleError(error, response);
        }
    },

    async editCatalogue(request: Request, response: Response) {
        try {
            requireAdmin(request);
            const orgId = requireOrgId(request);

            const validatedData = editFormSchema.safeParse(request.body);
            if (!validatedData.success) throw new ValidationError("Invalid Entries");

            await catalogueService.editCatalogue(validatedData.data, orgId);
            return response.status(200).json({ success: true, message: "Catalogue edited successfully" });
        } catch (error) {
            return handleError(error, response);
        }
    },

    async deleteCatalogue(request: Request, response: Response) {
        try {
            requireAdmin(request);
            const orgId = requireOrgId(request);

            const validatedData = deleteFormSchema.safeParse(request.body);
            if (!validatedData.success) throw new ValidationError("Invalid Entries");

            await catalogueService.deleteCatalogue(validatedData.data, orgId);
            return response.status(200).json({ success: true, message: "Catalogue deleted successfully" });
        } catch (error) {
            return handleError(error, response);
        }
    },

    // ─── Supplier Controllers ─────────────────────────────────────────────────

    async getSuppliers(request: Request, response: Response) {
        try {
            const orgId = requireOrgId(request);
            const result = await catalogueService.getSuppliers(orgId);
            return response.status(200).json(result);
        } catch (error) {
            return handleError(error, response);
        }
    },

    async createSupplier(request: Request, response: Response) {
        try {
            requireAdmin(request);
            const orgId = requireOrgId(request);

            const validatedData = createSupplierSchema.safeParse(request.body);
            if (!validatedData.success) throw new ValidationError("Invalid Entries");

            const result = await catalogueService.createSupplier(validatedData.data, orgId);
            return response.status(201).json({ success: true, data: result });
        } catch (error) {
            return handleError(error, response);
        }
    },

    async editSupplier(request: Request, response: Response) {
        try {
            requireAdmin(request);
            const orgId = requireOrgId(request);

            const validatedData = editSupplierSchema.safeParse({
                ...request.body,
                supplierId: request.params.id,
            });
            if (!validatedData.success) throw new ValidationError("Invalid Entries");

            const result = await catalogueService.editSupplier(validatedData.data, orgId);
            return response.status(200).json({ success: true, data: result });
        } catch (error) {
            return handleError(error, response);
        }
    },

    async deleteSupplier(request: Request, response: Response) {
        try {
            requireAdmin(request);
            const orgId = requireOrgId(request);

            const validatedData = deleteSupplierSchema.safeParse({ supplierId: request.params.id });
            if (!validatedData.success) throw new ValidationError("Invalid Entries");

            await catalogueService.deleteSupplier(validatedData.data, orgId);
            return response.status(200).json({ success: true, message: "Supplier deleted successfully" });
        } catch (error) {
            return handleError(error, response);
        }
    },

    // ─── Supplier Quote Controllers ───────────────────────────────────────────

    async getQuotesByCatalogue(request: Request, response: Response) {
        try {
            const orgId = requireOrgId(request);
            const { catalogueId } = request.params;
            if (!catalogueId) throw new ValidationError("Catalogue ID is required");

            const result = await catalogueService.getQuotesByCatalogue(catalogueId as string, orgId);
            return response.status(200).json(result);
        } catch (error) {
            return handleError(error, response);
        }
    },

    async createSupplierQuote(request: Request, response: Response) {
        try {
            requireAdmin(request);
            const orgId = requireOrgId(request);

            const validatedData = createSupplierQuoteSchema.safeParse(request.body);
            if (!validatedData.success) throw new ValidationError("Invalid Entries");

            const result = await catalogueService.createSupplierQuote(validatedData.data, orgId);
            return response.status(201).json({ success: true, data: result });
        } catch (error) {
            return handleError(error, response);
        }
    },

    async editSupplierQuote(request: Request, response: Response) {
        try {
            requireAdmin(request);
            const orgId = requireOrgId(request);

            const validatedData = editSupplierQuoteSchema.safeParse({
                ...request.body,
                quoteId: request.params.id,
            });
            if (!validatedData.success) throw new ValidationError("Invalid Entries");

            const result = await catalogueService.editSupplierQuote(validatedData.data, orgId);
            return response.status(200).json({ success: true, data: result });
        } catch (error) {
            return handleError(error, response);
        }
    },

    async deleteSupplierQuote(request: Request, response: Response) {
        try {
            requireAdmin(request);
            const orgId = requireOrgId(request);

            const validatedData = deleteSupplierQuoteSchema.safeParse({ quoteId: request.params.id });
            if (!validatedData.success) throw new ValidationError("Invalid Entries");

            await catalogueService.deleteSupplierQuote(validatedData.data, orgId);
            return response.status(200).json({ success: true, message: "Quote deleted successfully" });
        } catch (error) {
            return handleError(error, response);
        }
    },

    // ─── Inventory Location Controllers ───────────────────────────────────────

    async getInventoryLocations(request: Request, response: Response) {
        try {
            const orgId = requireOrgId(request);
            const result = await catalogueService.getInventoryLocations(orgId);
            return response.status(200).json(result);
        } catch (error) {
            return handleError(error, response);
        }
    },

    async createInventoryLocation(request: Request, response: Response) {
        try {
            requireAdmin(request);
            const orgId = requireOrgId(request);

            const validatedData = createInventoryLocationSchema.safeParse(request.body);
            if (!validatedData.success) throw new ValidationError("Invalid Entries");

            const result = await catalogueService.createInventoryLocation(validatedData.data, orgId);
            return response.status(201).json({ success: true, data: result });
        } catch (error) {
            return handleError(error, response);
        }
    },

    async editInventoryLocation(request: Request, response: Response) {
        try {
            requireAdmin(request);
            const orgId = requireOrgId(request);

            const validatedData = editInventoryLocationSchema.safeParse({
                ...request.body,
                locationId: request.params.id,
            });
            if (!validatedData.success) throw new ValidationError("Invalid Entries");

            const result = await catalogueService.editInventoryLocation(validatedData.data, orgId);
            return response.status(200).json({ success: true, data: result });
        } catch (error) {
            return handleError(error, response);
        }
    },

    async deleteInventoryLocation(request: Request, response: Response) {
        try {
            requireAdmin(request);
            const orgId = requireOrgId(request);

            const validatedData = deleteInventoryLocationSchema.safeParse({ locationId: request.params.id });
            if (!validatedData.success) throw new ValidationError("Invalid Entries");

            await catalogueService.deleteInventoryLocation(validatedData.data, orgId);
            return response.status(200).json({ success: true, message: "Location deleted successfully" });
        } catch (error) {
            return handleError(error, response);
        }
    },

    // ─── Inventory Ledger Controllers ─────────────────────────────────────────

    async getInventoryBalances(request: Request, response: Response) {
        try {
            const orgId = requireOrgId(request);
            const result = await catalogueService.getInventoryBalances(orgId);
            return response.status(200).json(result);
        } catch (error) {
            return handleError(error, response);
        }
    },

    async receiveMaterial(request: Request, response: Response) {
        try {
            requireAdmin(request);
            const orgId = requireOrgId(request);
            const userId = request.session?.userId;
            if (!userId) throw new UnAuthorizedError("Unauthorized");

            const validatedData = receiveMaterialSchema.safeParse(request.body);
            if (!validatedData.success) throw new ValidationError("Invalid Entries");

            const membershipId = await resolveMembershipId(userId, orgId);
            const result = await catalogueService.receiveMaterial(validatedData.data, orgId, membershipId);
            return response.status(201).json({ success: true, data: result });
        } catch (error) {
            return handleError(error, response);
        }
    },

    async consumeMaterial(request: Request, response: Response) {
        try {
            requireAdmin(request);
            const orgId = requireOrgId(request);
            const userId = request.session?.userId;
            if (!userId) throw new UnAuthorizedError("Unauthorized");

            const validatedData = consumeMaterialSchema.safeParse(request.body);
            if (!validatedData.success) throw new ValidationError("Invalid Entries");

            const membershipId = await resolveMembershipId(userId, orgId);
            const result = await catalogueService.consumeMaterial(validatedData.data, orgId, membershipId);
            return response.status(201).json({ success: true, data: result });
        } catch (error) {
            return handleError(error, response);
        }
    },

    async adjustMaterial(request: Request, response: Response) {
        try {
            requireAdmin(request);
            const orgId = requireOrgId(request);
            const userId = request.session?.userId;
            if (!userId) throw new UnAuthorizedError("Unauthorized");

            const validatedData = adjustMaterialSchema.safeParse(request.body);
            if (!validatedData.success) throw new ValidationError("Invalid Entries");

            const membershipId = await resolveMembershipId(userId, orgId);
            const result = await catalogueService.adjustMaterial(validatedData.data, orgId, membershipId);
            return response.status(200).json({ success: true, data: result });
        } catch (error) {
            return handleError(error, response);
        }
    },

    async getInventoryTransactions(request: Request, response: Response) {
        try {
            const orgId = requireOrgId(request);

            const validatedData = getInventoryTransactionsSchema.safeParse({
                catalogueId: request.query.catalogueId,
                locationId: request.query.locationId,
                pageIndex: request.query.index,
                pageSize: request.query.size,
            });
            if (!validatedData.success) throw new ValidationError("Invalid Request Parameters");

            const result = await catalogueService.getInventoryTransactions(validatedData.data, orgId);
            return response.status(200).json(result);
        } catch (error) {
            return handleError(error, response);
        }
    },
};

export default catalogueController;
