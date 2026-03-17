import { Router } from "express";
import { authorize } from "../../shared/middleware/authorize.middleware";
import { requiredRole } from "../../shared/middleware/requireRole.middleware";
import dashboardController from "./dashboard.controller";
import { orgAuthorize } from "../../shared/middleware/orgAuthorize.middleware";

const dashboardRouter = Router();

dashboardRouter.get("/", authorize, orgAuthorize, requiredRole("ADMIN"), dashboardController.getDashboardItems)

export default dashboardRouter;