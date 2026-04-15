import { Router } from "express";
import { authorize } from "../../shared/middleware/authorize.middleware.js";
import { requiredRole } from "../../shared/middleware/requireRole.middleware.js";
import dashboardController from "./dashboard.controller.js";
import { orgAuthorize } from "../../shared/middleware/orgAuthorize.middleware.js";

const dashboardRouter = Router();

dashboardRouter.get("/", authorize, orgAuthorize, requiredRole("ADMIN"), dashboardController.getDashboardItems);
dashboardRouter.post("/", authorize, orgAuthorize, requiredRole("ADMIN"), dashboardController.orderItem);

dashboardRouter.get("/engineer", authorize, orgAuthorize, requiredRole("ENGINEER"), dashboardController.getEngineerDashboardItems);
dashboardRouter.get("/client", authorize, orgAuthorize, requiredRole("CLIENT"), dashboardController.getClientDashboardItems);
dashboardRouter.get("/pending-approvals", authorize, orgAuthorize, requiredRole("ADMIN"), dashboardController.getPendingApprovalsSummary);

// Restored missing routes
dashboardRouter.get("/requisition/slug/:reqSlug", authorize, orgAuthorize, dashboardController.getRequisitionBySlug);
dashboardRouter.get("/payment/id/:phaseId", authorize, orgAuthorize, requiredRole("ADMIN"), dashboardController.getPendingPaymentById);
dashboardRouter.post("/payment/approve", authorize, orgAuthorize, requiredRole("ADMIN"), dashboardController.approvePendingPayment);

export default dashboardRouter;