import { Router } from "express";
import { authorize } from "../../shared/middleware/authorize.middleware";
import { orgAuthorize } from "../../shared/middleware/orgAuthorize.middleware";
import catalogueController from "./catalogue.controller";

const catalogueRouter = Router();

catalogueRouter.get("/", authorize, orgAuthorize, catalogueController.getCatalogue)

catalogueRouter.post("/", authorize, orgAuthorize, catalogueController.createCatalogue)

catalogueRouter.put("/", authorize, orgAuthorize, catalogueController.editCatalogue)

catalogueRouter.post("/deleteCatalogue", authorize, orgAuthorize, catalogueController.deleteCatalogue)


export default catalogueRouter;