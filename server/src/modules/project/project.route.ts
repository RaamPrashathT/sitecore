import { Router } from "express";
import { authorize } from "../../shared/middleware/authorize.middleware.js";
import { orgAuthorize } from "../../shared/middleware/orgAuthorize.middleware.js";
import { requiredRole } from "../../shared/middleware/requireRole.middleware.js";
import projectController from "./project.controller.js";
import { projectAuthorize } from "../../shared/middleware/projectAuthorize.middleware.js";

const projectRouter = Router();

projectRouter.post("/", authorize, orgAuthorize, requiredRole("ADMIN"), projectController.createProject )

projectRouter.get("/", authorize, orgAuthorize, projectController.getProjects)

projectRouter.post("/phase", authorize, orgAuthorize, requiredRole(["ADMIN", "ENGINEER"]),projectAuthorize, projectController.createPhase)

projectRouter.get("/phase", authorize, orgAuthorize, projectAuthorize, projectController.getPhases) 

projectRouter.get("/members", authorize, orgAuthorize, projectAuthorize, requiredRole(["ADMIN", "ENGINEER", "CLIENT"]), projectController.getMembers)

projectRouter.put("/phase/payment_approval", authorize, orgAuthorize, requiredRole("ADMIN"), projectController.paymentApproval)

projectRouter.post("/phase/requisition", authorize, orgAuthorize, requiredRole(["ADMIN", "ENGINEER"]), projectAuthorize, projectController.createRequisition)

projectRouter.get("/paymentPendingPhases", authorize, orgAuthorize, requiredRole("ADMIN"), projectController.getPaymentPendingPhases)

projectRouter.get("/pendingRequisitions", authorize, orgAuthorize, requiredRole("ADMIN"), projectController.getPendingRequisitions);

projectRouter.post("/phase/approveRequisition", authorize, orgAuthorize, requiredRole("ADMIN"), projectController.approveRequisition);

projectRouter.post("/phase/rejectRequisition", authorize, orgAuthorize, requiredRole("ADMIN"), projectController.rejectRequisition);

projectRouter.post("/phase/requisitionItems", authorize, orgAuthorize, requiredRole(["ADMIN", "ENGINEER"]), projectAuthorize, projectController.postRequisitionItems)

projectRouter.get("/:projectSlug", authorize, orgAuthorize, projectController.getProjectDetails)

projectRouter.get("/phase/requisition/:requisitionIdSlug", authorize, orgAuthorize, projectAuthorize, projectController.getRequisitionDetails)

export default projectRouter;