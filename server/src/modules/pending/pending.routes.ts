import { Router } from "express";
import { authorize } from "../../shared/middleware/authorize.middleware.js";
import { orgAuthorize } from "../../shared/middleware/orgAuthorize.middleware.js";
import { requiredRole } from "../../shared/middleware/requireRole.middleware.js";
import pendingController from "./pending.controller.js";

const pendingRouter = Router();

pendingRouter.get("/invitations", authorize, orgAuthorize, requiredRole("ADMIN"), pendingController.getPendingInvitations)

pendingRouter.post("/assignClient", authorize, orgAuthorize, requiredRole("ADMIN"), pendingController.assignClient)

pendingRouter.post("/assignEngineer", authorize, orgAuthorize, requiredRole("ADMIN"), pendingController.assignEngineer)


export default pendingRouter;