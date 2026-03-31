import { Router } from "express";
import { authorize } from "../../shared/middleware/authorize.middleware.js";
import orgController from "./organization.controller.js";
import { orgAuthorize } from "../../shared/middleware/orgAuthorize.middleware.js";
import { requiredRole } from "../../shared/middleware/requireRole.middleware.js";
import { projectAuthorize } from "../../shared/middleware/projectAuthorize.middleware.js";

const orgRouter = Router();

orgRouter.post("/", authorize, orgController.create)

orgRouter.post("/signup", authorize, orgController.signin)

orgRouter.get("/", authorize, orgController.getOrg)

orgRouter.get("/all", authorize, orgController.getAllOrg)

orgRouter.post("/identity", authorize, orgController.identity);

orgRouter.get("/notifications", authorize, orgAuthorize, requiredRole(["ADMIN", "ENGINEER", "CLIENT"]), orgController.getNotifications)

export default orgRouter