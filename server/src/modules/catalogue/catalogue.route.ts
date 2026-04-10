import { Router } from "express";
import { authorize } from "../../shared/middleware/authorize.middleware.js";
import { orgAuthorize } from "../../shared/middleware/orgAuthorize.middleware.js";
import catalogueController from "./catalogue.controller.js";
import { requiredRole } from "../../shared/middleware/requireRole.middleware.js";

const catalogueRouter = Router();

catalogueRouter.get("/", authorize, orgAuthorize, catalogueController.getCatalogue);
catalogueRouter.get("/form-options", authorize, orgAuthorize, catalogueController.getFormOptions);
catalogueRouter.get("/:id", authorize, orgAuthorize, catalogueController.getCatalogueById);

catalogueRouter.post("/", authorize, orgAuthorize, requiredRole("ADMIN"), catalogueController.createCatalogue);
catalogueRouter.put("/:id", authorize, orgAuthorize, requiredRole("ADMIN"), catalogueController.updateCatalogue);
catalogueRouter.delete("/:id", authorize, orgAuthorize, requiredRole("ADMIN"), catalogueController.deleteCatalogue);

catalogueRouter.post("/:id/quotes", authorize, orgAuthorize, requiredRole("ADMIN"), catalogueController.createQuote);
catalogueRouter.put("/:id/quotes/:quoteId", authorize, orgAuthorize, requiredRole("ADMIN"), catalogueController.updateQuote);
catalogueRouter.delete("/:id/quotes/:quoteId", authorize, orgAuthorize, requiredRole("ADMIN"), catalogueController.deleteQuote);

catalogueRouter.post("/:id/inventory", authorize, orgAuthorize, requiredRole("ADMIN"), catalogueController.addInventory);
catalogueRouter.put("/:id/inventory/:inventoryId", authorize, orgAuthorize, requiredRole("ADMIN"), catalogueController.updateInventory);

export default catalogueRouter;