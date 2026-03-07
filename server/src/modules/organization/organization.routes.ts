import { Router } from "express";
import { authorize } from "../../shared/middleware/authorize.middleware.js";
import orgController from "./organization.controller.js";

const orgRouter = Router();

orgRouter.post("/", authorize, orgController.create)

orgRouter.get("/", authorize, orgController.getOrg)

orgRouter.post("/identity", authorize, orgController.identity);

export default orgRouter