import { Router } from "express";
import { authorize } from "../../shared/middleware/authorize.middleware";
import { orgAuthorize } from "../../shared/middleware/orgAuthorize.middleware";
import { requiredRole } from "../../shared/middleware/requireRole.middleware";
import engineerController from "./engineers.controller";

const engRouter = Router();

engRouter.get("/", authorize, orgAuthorize, requiredRole("ADMIN"), engineerController.getEngineers)

export default engRouter;