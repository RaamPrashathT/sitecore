import { Router } from "express";
import { authorize } from "../../shared/middleware/authorize.middleware.js";
import { orgAuthorize } from "../../shared/middleware/orgAuthorize.middleware.js";
import { requiredRole } from "../../shared/middleware/requireRole.middleware.js";
import engineerController from "./engineers.controller.js";

const engRouter = Router();

engRouter.get("/", authorize, orgAuthorize, requiredRole("ADMIN"), engineerController.getEngineers)

export default engRouter;