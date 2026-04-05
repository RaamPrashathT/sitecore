import { Router } from "express";
import { authorize } from "../../shared/middleware/authorize.middleware.js";
import { requiredRole } from "../../shared/middleware/requireRole.middleware.js";
import dashboardController from "./dashboard.controller.js";
import { orgAuthorize } from "../../shared/middleware/orgAuthorize.middleware.js";

const dashboardRouter = Router();

dashboardRouter.get(
    "/",
    authorize,
    orgAuthorize,
    requiredRole("ADMIN"),
    dashboardController.getDashboardItems,
);

dashboardRouter.post(
    "/",
    authorize,
    orgAuthorize,
    requiredRole("ADMIN"),
    dashboardController.orderItem,
);

dashboardRouter.get(
    "/engineer",
    authorize,
    orgAuthorize,
    requiredRole("ENGINEER"),
    dashboardController.getEngineerDashboardItems,
);

dashboardRouter.get(
    "/client",
    authorize,
    orgAuthorize,
    dashboardController.getClientDashboardItems,
);
dashboardRouter.get(
    "/pending-approvals",
    authorize,
    orgAuthorize,
    requiredRole("ADMIN"),
    dashboardController.getPendingApprovalsSummary,
);

dashboardRouter.get(
    "/requisition/slug/:reqSlug", 
    authorize, 
    orgAuthorize, 
    dashboardController.getRequisitionBySlug
);

dashboardRouter.get(
    "/payment/id/:phaseId", 
    authorize, 
    orgAuthorize, 
    requiredRole("ADMIN"),
    dashboardController.getPendingPaymentById
);

dashboardRouter.put(
    "/phase/payment_approval",
    authorize,
    orgAuthorize,
    requiredRole("ADMIN"),
    dashboardController.approvePendingPayment
);
export default dashboardRouter;
