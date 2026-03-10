import { Router } from "express";
import { authorize } from "../../shared/middleware/authorize.middleware.js";
import { orgAuthorize } from "../../shared/middleware/orgAuthorize.middleware.js";
import catalogueController from "./catalogue.controller.js";

const catalogueRouter = Router();

catalogueRouter.get("/", authorize, orgAuthorize, catalogueController.getCatalogue)

catalogueRouter.post("/", authorize, orgAuthorize, catalogueController.createCatalogue)

catalogueRouter.put("/", authorize, orgAuthorize, catalogueController.editCatalogue)

catalogueRouter.post("/deleteCatalogue", authorize, orgAuthorize, catalogueController.deleteCatalogue)


export default catalogueRouter;