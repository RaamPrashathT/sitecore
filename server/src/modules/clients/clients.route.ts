import { Router } from "express";
import { authorize } from "../../shared/middleware/authorize.middleware.js";
import { orgAuthorize } from "../../shared/middleware/orgAuthorize.middleware.js";
import { requiredRole } from "../../shared/middleware/requireRole.middleware.js";
import clientController from "./clients.controller.js";

const clientRouter = Router();

clientRouter.get("/", authorize, orgAuthorize, requiredRole("ADMIN"), clientController.getClients)

export default clientRouter;