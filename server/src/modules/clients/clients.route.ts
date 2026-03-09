import { Router } from "express";
import { authorize } from "../../shared/middleware/authorize.middleware";
import { orgAuthorize } from "../../shared/middleware/orgAuthorize.middleware";
import { requiredRole } from "../../shared/middleware/requireRole.middleware";
import clientController from "./clients.controller";

const clientRouter = Router();

clientRouter.get("/", authorize, orgAuthorize, requiredRole("ADMIN"), clientController.getClients)

export default clientRouter;