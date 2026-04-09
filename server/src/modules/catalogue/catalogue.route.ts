import { Router } from "express";
import { authorize } from "../../shared/middleware/authorize.middleware.js";
import { orgAuthorize } from "../../shared/middleware/orgAuthorize.middleware.js";
import catalogueController from "./catalogue.controller.js";
import { requiredRole } from "../../shared/middleware/requireRole.middleware.js";

const catalogueRouter = Router();

catalogueRouter.get("/", authorize, orgAuthorize, requiredRole("ADMIN"), catalogueController.getCatalogue)

catalogueRouter.post("/", authorize, orgAuthorize, catalogueController.createCatalogue)

catalogueRouter.put("/", authorize, orgAuthorize, catalogueController.editCatalogue)

catalogueRouter.post("/deleteCatalogue", authorize, orgAuthorize, catalogueController.deleteCatalogue)

catalogueRouter.get("/:catalogueId/:quoteId", authorize, orgAuthorize, requiredRole("ADMIN"), catalogueController.getCatalogueById)

export default catalogueRouter;