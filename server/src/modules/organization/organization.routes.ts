import { Router } from "express";
import { authorize } from "../../shared/middleware/authorize.middleware.js";
import orgController from "./organization.controller.js";

const orgRouter = Router();

orgRouter.post("/create", authorize, orgController.createOrg)

orgRouter.get("/getOrgs", authorize, orgController.getOrg)

orgRouter.post("/identity", authorize, orgController.identity);

export default orgRouter