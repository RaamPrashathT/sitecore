import { Router } from "express";
import { authorize } from "../../shared/middleware/authorize.middleware.js";
import { orgAuthorize } from "../../shared/middleware/orgAuthorize.middleware.js";
import { requiredRole } from "../../shared/middleware/requireRole.middleware.js";

import catalogueController from "./catalogue/catalogue.controller.js";
import suppliersController from "./suppliers/suppliers.controller.js";
import supplierQuotesController from "./supplier-quotes/supplierQuotes.controller.js";
import quoteHistoryController from "./quote-history/quoteHistory.controller.js";
import inventoryLocationsController from "./inventory-locations/inventoryLocations.controller.js";
import inventoryStocksController from "./inventory-stocks/inventoryStocks.controller.js";
import inventoryMovementsController from "./inventory-movements/inventoryMovements.controller.js";

const catalogueRouter = Router();

// Catalogue
catalogueRouter.get("/", authorize, orgAuthorize, requiredRole("ADMIN"), catalogueController.getCatalogue);
catalogueRouter.post("/", authorize, orgAuthorize, requiredRole("ADMIN"), catalogueController.createCatalogue);
catalogueRouter.get("/:catalogueId", authorize, orgAuthorize, requiredRole("ADMIN"), catalogueController.getCatalogueById);
catalogueRouter.patch("/:catalogueId", authorize, orgAuthorize, requiredRole("ADMIN"), catalogueController.editCatalogue);
catalogueRouter.delete("/:catalogueId", authorize, orgAuthorize, requiredRole("ADMIN"), catalogueController.deleteCatalogue);
catalogueRouter.get("/:catalogueId/quotes", authorize, orgAuthorize, requiredRole("ADMIN"), supplierQuotesController.getQuotesByCatalogueId);
catalogueRouter.get("/:catalogueId/suppliers", authorize, orgAuthorize, requiredRole("ADMIN"), suppliersController.getSuppliersByCatalogueId);

// Suppliers
catalogueRouter.get("/suppliers", authorize, orgAuthorize, requiredRole("ADMIN"), suppliersController.getSuppliers);
catalogueRouter.get("/suppliers/:supplierId", authorize, orgAuthorize, requiredRole("ADMIN"), suppliersController.getSupplierById);
catalogueRouter.post("/suppliers", authorize, orgAuthorize, requiredRole("ADMIN"), suppliersController.createSupplier);
catalogueRouter.patch("/suppliers/:supplierId", authorize, orgAuthorize, requiredRole("ADMIN"), suppliersController.editSupplier);
catalogueRouter.delete("/suppliers/:supplierId", authorize, orgAuthorize, requiredRole("ADMIN"), suppliersController.deleteSupplier);
catalogueRouter.post("/suppliers/:supplierId/restore", authorize, orgAuthorize, requiredRole("ADMIN"), suppliersController.restoreSupplier);
catalogueRouter.get("/suppliers/:supplierId/quotes", authorize, orgAuthorize, requiredRole("ADMIN"), supplierQuotesController.getQuotesBySupplierId);
catalogueRouter.get("/suppliers/:supplierId/catalogue-items", authorize, orgAuthorize, requiredRole("ADMIN"), suppliersController.getCatalogueItemsBySupplierId);

// Supplier quotes
catalogueRouter.get("/supplier-quotes", authorize, orgAuthorize, requiredRole("ADMIN"), supplierQuotesController.getSupplierQuotes);
catalogueRouter.get("/supplier-quotes/:quoteId", authorize, orgAuthorize, requiredRole("ADMIN"), supplierQuotesController.getSupplierQuoteById);
catalogueRouter.post("/supplier-quotes", authorize, orgAuthorize, requiredRole("ADMIN"), supplierQuotesController.createSupplierQuote);
catalogueRouter.patch("/supplier-quotes/:quoteId", authorize, orgAuthorize, requiredRole("ADMIN"), supplierQuotesController.editSupplierQuote);
catalogueRouter.delete("/supplier-quotes/:quoteId", authorize, orgAuthorize, requiredRole("ADMIN"), supplierQuotesController.deleteSupplierQuote);

// Quote history
catalogueRouter.get("/supplier-quotes/:quoteId/history", authorize, orgAuthorize, requiredRole("ADMIN"), quoteHistoryController.getQuoteHistory);
catalogueRouter.get("/supplier-quotes/:quoteId/history/:historyId", authorize, orgAuthorize, requiredRole("ADMIN"), quoteHistoryController.getQuoteHistoryById);

// Inventory locations
catalogueRouter.get("/inventory/locations", authorize, orgAuthorize, requiredRole("ADMIN"), inventoryLocationsController.getInventoryLocations);
catalogueRouter.get("/inventory/locations/:locationId", authorize, orgAuthorize, requiredRole("ADMIN"), inventoryLocationsController.getInventoryLocationById);
catalogueRouter.post("/inventory/locations", authorize, orgAuthorize, requiredRole("ADMIN"), inventoryLocationsController.createInventoryLocation);
catalogueRouter.patch("/inventory/locations/:locationId", authorize, orgAuthorize, requiredRole("ADMIN"), inventoryLocationsController.editInventoryLocation);
catalogueRouter.delete("/inventory/locations/:locationId", authorize, orgAuthorize, requiredRole("ADMIN"), inventoryLocationsController.deleteInventoryLocation);
catalogueRouter.get("/inventory/locations/:locationId/stocks", authorize, orgAuthorize, requiredRole("ADMIN"), inventoryLocationsController.getStocksByLocationId);
catalogueRouter.get("/inventory/locations/:locationId/movements", authorize, orgAuthorize, requiredRole("ADMIN"), inventoryLocationsController.getMovementsByLocationId);

// Inventory stocks
catalogueRouter.get("/inventory/stocks", authorize, orgAuthorize, requiredRole("ADMIN"), inventoryStocksController.getInventoryStocks);
catalogueRouter.get("/inventory/stocks/:stockId", authorize, orgAuthorize, requiredRole("ADMIN"), inventoryStocksController.getInventoryStockById);
catalogueRouter.get("/inventory/catalogue-items/:catalogueId/stocks", authorize, orgAuthorize, requiredRole("ADMIN"), inventoryStocksController.getStocksByCatalogueId);

// Inventory movements
catalogueRouter.get("/inventory/movements", authorize, orgAuthorize, requiredRole("ADMIN"), inventoryMovementsController.getInventoryMovements);
catalogueRouter.get("/inventory/movements/:movementId", authorize, orgAuthorize, requiredRole("ADMIN"), inventoryMovementsController.getInventoryMovementById);
catalogueRouter.post("/inventory/movements/receipt", authorize, orgAuthorize, requiredRole("ADMIN"), inventoryMovementsController.createReceipt);
catalogueRouter.post("/inventory/movements/issue", authorize, orgAuthorize, requiredRole("ADMIN"), inventoryMovementsController.createIssue);
catalogueRouter.post("/inventory/movements/transfer", authorize, orgAuthorize, requiredRole("ADMIN"), inventoryMovementsController.createTransfer);
catalogueRouter.post("/inventory/movements/adjustment", authorize, orgAuthorize, requiredRole("ADMIN"), inventoryMovementsController.createAdjustment);

export default catalogueRouter;