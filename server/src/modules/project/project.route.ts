import { Router } from "express";
import { authorize } from "../../shared/middleware/authorize.middleware.js";
import { orgAuthorize } from "../../shared/middleware/orgAuthorize.middleware.js";
import { requiredRole } from "../../shared/middleware/requireRole.middleware.js";
import { projectAuthorize } from "../../shared/middleware/projectAuthorize.middleware.js";
import coreController from "./core/core.controller.js";
import phaseController from "./phase/phase.controller.js";
import requisitionController from "./requisition/requisition.controller.js";
import sitelogController from "./sitelog/sitelog.controller.js";

const projectRouter = Router();

projectRouter.post("/", authorize, orgAuthorize, requiredRole("ADMIN"), coreController.createProject);
projectRouter.get("/", authorize, orgAuthorize, coreController.getProjects);
projectRouter.get("/members", authorize, orgAuthorize, projectAuthorize, requiredRole(["ADMIN", "ENGINEER", "CLIENT"]), coreController.getMembers);
projectRouter.post("/invitation", authorize, orgAuthorize, requiredRole(["ADMIN", "ENGINEER"]), projectAuthorize, coreController.createInvitation);
projectRouter.get("/details", authorize, orgAuthorize, projectAuthorize, coreController.getProjectDetails);
projectRouter.put("/", authorize, orgAuthorize, projectAuthorize, requiredRole("ADMIN"), coreController.updateProject);
projectRouter.post("/members", authorize, orgAuthorize, projectAuthorize, requiredRole("ADMIN"), coreController.assignMember);
projectRouter.delete("/members", authorize, orgAuthorize, projectAuthorize, requiredRole("ADMIN"), coreController.removeMember);

projectRouter.get("/timeline", authorize, orgAuthorize, projectAuthorize, requiredRole(["ADMIN", "ENGINEER", "CLIENT"]), phaseController.getProjectTimeline);
projectRouter.post("/phase", authorize, orgAuthorize, projectAuthorize, requiredRole(["ADMIN", "ENGINEER"]), phaseController.createPhase);
projectRouter.get("/phases", authorize, orgAuthorize, projectAuthorize, requiredRole(["ADMIN", "ENGINEER", "CLIENT"]), phaseController.getPhases);
projectRouter.get("/phase/:phaseId/details", authorize, orgAuthorize, projectAuthorize, requiredRole(["ADMIN", "ENGINEER", "CLIENT"]), phaseController.getPhaseDetails);
projectRouter.put("/phase/:phaseSlug", authorize, orgAuthorize, projectAuthorize, requiredRole(["ADMIN", "ENGINEER"]), phaseController.updatePhase);
projectRouter.delete("/phase/:phaseId", authorize, orgAuthorize, projectAuthorize, requiredRole(["ADMIN", "ENGINEER"]), phaseController.deletePhase);
projectRouter.post("/phase/:phaseId/request-payment", authorize, orgAuthorize, projectAuthorize, requiredRole("ADMIN"), phaseController.requestPayment);
projectRouter.post("/phase/:phaseId/approve-payment", authorize, orgAuthorize, projectAuthorize, requiredRole("ADMIN"), phaseController.approvePayment);
projectRouter.post("/phase/:phaseId/complete", authorize, orgAuthorize, projectAuthorize, requiredRole(["ADMIN", "ENGINEER"]), phaseController.completePhase);
projectRouter.get("/paymentPendingPhases", authorize, orgAuthorize, requiredRole("ADMIN"), phaseController.getPaymentPendingPhases);
projectRouter.put("/phase/payment_approval", authorize, orgAuthorize, requiredRole("ADMIN"), phaseController.paymentApproval)
projectRouter.get("/phase/:phaseSlug/info", authorize, orgAuthorize, projectAuthorize, requiredRole(["ADMIN", "ENGINEER", "CLIENT"]), phaseController.getPhaseInfo);

projectRouter.get( "/phase/:phaseSlug/requisition-catalogue",  authorize, orgAuthorize, projectAuthorize, requiredRole(["ADMIN", "ENGINEER", "CLIENT"]), requisitionController.getRequisitionCatalogue);
projectRouter.get("/phase/:phaseSlug/requisition/:requisitionSlug", authorize, orgAuthorize, projectAuthorize, requiredRole(["ADMIN", "ENGINEER", "CLIENT"]), requisitionController.getRequisitionDetails);
projectRouter.get("/requisitions", authorize, orgAuthorize, projectAuthorize, requiredRole(["ADMIN", "ENGINEER", "CLIENT"]), requisitionController.getProjectRequisitions);
projectRouter.post("/phase/:phaseId/requisition", authorize, orgAuthorize, projectAuthorize, requiredRole(["ADMIN", "ENGINEER"]), requisitionController.createRequisition);
projectRouter.post("/requisition/:requisitionId/approve", authorize, orgAuthorize, requiredRole("ADMIN"), requisitionController.approveRequisition);
projectRouter.post("/requisition/:requisitionId/reject", authorize, orgAuthorize, requiredRole("ADMIN"), requisitionController.rejectRequisition);
projectRouter.get("/pendingRequisitions", authorize, orgAuthorize, requiredRole("ADMIN"), requisitionController.getPendingRequisitions);
projectRouter.get("/phase/:phaseSlug/all-requisitions", authorize, orgAuthorize, projectAuthorize, requiredRole(["ADMIN", "ENGINEER", "CLIENT"]), requisitionController.getAllPhaseRequisitions);

projectRouter.post("/phase/:phaseSlug/sitelog", authorize, orgAuthorize, projectAuthorize, requiredRole(["ADMIN", "ENGINEER"]), sitelogController.createSiteLog);
projectRouter.post("/sitelog/:sitelogId/comment", authorize, orgAuthorize, projectAuthorize, requiredRole(["ADMIN", "ENGINEER", "CLIENT"]), sitelogController.createComment);

export default projectRouter;