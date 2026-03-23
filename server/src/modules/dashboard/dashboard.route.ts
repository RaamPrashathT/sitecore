import { Router } from "express";
import { authorize } from "../../shared/middleware/authorize.middleware.js";
import { requiredRole } from "../../shared/middleware/requireRole.middleware.js";
import dashboardController from "./dashboard.controller.js";
import { orgAuthorize } from "../../shared/middleware/orgAuthorize.middleware.js";

const dashboardRouter = Router();

dashboardRouter.get("/", authorize, orgAuthorize, requiredRole("ADMIN"), dashboardController.getDashboardItems)

dashboardRouter.post("/", authorize, orgAuthorize, requiredRole("ADMIN"), dashboardController.setDashboardItems)

dashboardRouter.get("/engineer", authorize, orgAuthorize, requiredRole("ENGINEER"), dashboardController.getEngineerDashboardItems)

dashboardRouter.get("/client", authorize, orgAuthorize, dashboardController.getClientDashboardItems)

export default dashboardRouter;