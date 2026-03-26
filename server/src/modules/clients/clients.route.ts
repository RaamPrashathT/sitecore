import { Router } from "express";
import { authorize } from "../../shared/middleware/authorize.middleware.js";
import { orgAuthorize } from "../../shared/middleware/orgAuthorize.middleware.js";
import { requiredRole } from "../../shared/middleware/requireRole.middleware.js";
import clientController from "./clients.controller.js";
import { validate } from "../../shared/middleware/validate.middleware.js";
import { createInviteBodySchema } from "./clients.schema.js";
import { loadSession } from "../../shared/middleware/loadSession.middleware.js";

const clientRouter = Router();

clientRouter.get("/", authorize, orgAuthorize, requiredRole("ADMIN"), clientController.getClients)

clientRouter.post("/invitation", authorize, orgAuthorize, requiredRole("ADMIN"), validate(createInviteBodySchema), clientController.createInvite)

clientRouter.get("/invitation-details", loadSession, clientController.getInvitationDetails)

clientRouter.post("/accept-invitation", loadSession, clientController.acceptInvite)

export default clientRouter;