import { Router } from "express";
import { authorize } from "../../shared/middleware/authorize.middleware";
import { orgAuthorize } from "../../shared/middleware/orgAuthorize.middleware";
import catalogueController from "./catalogue.controller";

const catalogueRouter = Router();

catalogueRouter.get("/getCatalogue", authorize, orgAuthorize, catalogueController.getCatalogue)

catalogueRouter.post("/createCatalogue", authorize, orgAuthorize, catalogueController.createCatalogue)

catalogueRouter.post("/editCatalogue", authorize, orgAuthorize, catalogueController.editCatalogue)

export default catalogueRouter;