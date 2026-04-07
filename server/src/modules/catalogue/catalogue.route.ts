import { Router } from "express";
import { authorize } from "../../shared/middleware/authorize.middleware.js";
import { orgAuthorize } from "../../shared/middleware/orgAuthorize.middleware.js";
import catalogueController from "./catalogue.controller.js";
import { requiredRole } from "../../shared/middleware/requireRole.middleware.js";

const catalogueRouter = Router();

catalogueRouter.get("/", authorize, orgAuthorize, catalogueController.getCatalogue);

catalogueRouter.post("/", authorize, orgAuthorize, requiredRole("ADMIN"), catalogueController.createCatalogue);

export default catalogueRouter;