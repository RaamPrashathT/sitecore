import { Router } from "express";
import { authorize } from "../../shared/middleware/authorize.middleware.js";
import { orgAuthorize } from "../../shared/middleware/orgAuthorize.middleware.js";
import { requiredRole } from "../../shared/middleware/requireRole.middleware.js";
import catalogueController from "./catalogue.controller.js";

const catalogueRouter = Router();

// ─── Catalogue (static routes first) ─────────────────────────────────────────
catalogueRouter.get("/", authorize, orgAuthorize, requiredRole("ADMIN"), catalogueController.getCatalogue);
catalogueRouter.post("/", authorize, orgAuthorize, catalogueController.createCatalogue);
catalogueRouter.put("/", authorize, orgAuthorize, catalogueController.editCatalogue);
catalogueRouter.post("/deleteCatalogue", authorize, orgAuthorize, catalogueController.deleteCatalogue);

// ─── Suppliers ────────────────────────────────────────────────────────────────
catalogueRouter.get("/supplier", authorize, orgAuthorize, catalogueController.getSuppliers);
catalogueRouter.post("/supplier", authorize, orgAuthorize, catalogueController.createSupplier);
catalogueRouter.put("/supplier/:id", authorize, orgAuthorize, catalogueController.editSupplier);
catalogueRouter.delete("/supplier/:id", authorize, orgAuthorize, catalogueController.deleteSupplier);

// ─── Supplier Quotes ──────────────────────────────────────────────────────────
catalogueRouter.post("/supplier-quote", authorize, orgAuthorize, catalogueController.createSupplierQuote);
catalogueRouter.put("/supplier-quote/:id", authorize, orgAuthorize, catalogueController.editSupplierQuote);
catalogueRouter.delete("/supplier-quote/:id", authorize, orgAuthorize, catalogueController.deleteSupplierQuote);

// ─── Inventory Locations ──────────────────────────────────────────────────────
catalogueRouter.get("/inventory-location", authorize, orgAuthorize, catalogueController.getInventoryLocations);
catalogueRouter.post("/inventory-location", authorize, orgAuthorize, catalogueController.createInventoryLocation);
catalogueRouter.put("/inventory-location/:id", authorize, orgAuthorize, catalogueController.editInventoryLocation);
catalogueRouter.delete("/inventory-location/:id", authorize, orgAuthorize, catalogueController.deleteInventoryLocation);

// ─── Inventory Ledger ─────────────────────────────────────────────────────────
catalogueRouter.get("/inventory", authorize, orgAuthorize, catalogueController.getInventoryBalances);
catalogueRouter.get("/inventory/transactions", authorize, orgAuthorize, catalogueController.getInventoryTransactions);
catalogueRouter.post("/inventory/receive", authorize, orgAuthorize, catalogueController.receiveMaterial);
catalogueRouter.post("/inventory/consume", authorize, orgAuthorize, catalogueController.consumeMaterial);
catalogueRouter.post("/inventory/adjust", authorize, orgAuthorize, catalogueController.adjustMaterial);

// ─── Catalogue param routes (must come after all static routes) ───────────────
catalogueRouter.get("/:catalogueId/quotes", authorize, orgAuthorize, catalogueController.getQuotesByCatalogue);
catalogueRouter.get("/:catalogueId", authorize, orgAuthorize, requiredRole("ADMIN"), catalogueController.getCatalogueById);

export default catalogueRouter;
