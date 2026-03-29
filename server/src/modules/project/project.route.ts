import { Router } from "express";
import { authorize } from "../../shared/middleware/authorize.middleware.js";
import { orgAuthorize } from "../../shared/middleware/orgAuthorize.middleware.js";
import { requiredRole } from "../../shared/middleware/requireRole.middleware.js";
import { projectAuthorize } from "../../shared/middleware/projectAuthorize.middleware.js";

// Import the split controllers
import coreController from "./core/core.controller.js";
import phaseController from "./phase/phase.controller.js";
import requisitionController from "./requisition/requisition.controller.js";
// import sitelogController from "./sitelog/sitelog.controller.js";

const projectRouter = Router();

// --- 1. CORE PROJECT ROUTES ---
projectRouter.post("/", authorize, orgAuthorize, requiredRole("ADMIN"), coreController.createProject);
projectRouter.get("/", authorize, orgAuthorize, coreController.getProjects);
projectRouter.get("/members", authorize, orgAuthorize, projectAuthorize, requiredRole(["ADMIN", "ENGINEER", "CLIENT"]), coreController.getMembers);
projectRouter.post("/invitation", authorize, orgAuthorize, requiredRole("ADMIN"), projectAuthorize, coreController.createInvitation);
projectRouter.get("/details", authorize, orgAuthorize, projectAuthorize, coreController.getProjectDetails);
projectRouter.put("/", authorize, orgAuthorize, projectAuthorize, requiredRole("ADMIN"), coreController.updateProject);
projectRouter.post("/members", authorize, orgAuthorize, projectAuthorize, requiredRole("ADMIN"), coreController.assignMember);
projectRouter.delete("/members", authorize, orgAuthorize, projectAuthorize, requiredRole("ADMIN"), coreController.removeMember);

projectRouter.post("/phase", authorize, orgAuthorize, projectAuthorize, requiredRole(["ADMIN", "ENGINEER"]), phaseController.createPhase);
// projectRouter.get("/phase", authorize, orgAuthorize, projectAuthorize, requiredRole(["ADMIN", "ENGINEER", "CLIENT"]), phaseController.getPhases);
// projectRouter.get("/phase/:phaseId", authorize, orgAuthorize, projectAuthorize, requiredRole(["ADMIN", "ENGINEER", "CLIENT"]), phaseController.getPhaseDetails);
projectRouter.put("/phase/:phaseId", authorize, orgAuthorize, projectAuthorize, requiredRole(["ADMIN", "ENGINEER"]), phaseController.updatePhase);
projectRouter.delete("/phase/:phaseId", authorize, orgAuthorize, projectAuthorize, requiredRole(["ADMIN", "ENGINEER"]), phaseController.deletePhase);
projectRouter.post("/phase/:phaseId/request-payment", authorize, orgAuthorize, projectAuthorize, requiredRole("ADMIN"), phaseController.requestPayment);
projectRouter.post("/phase/:phaseId/approve-payment", authorize, orgAuthorize, projectAuthorize, requiredRole("ADMIN"), phaseController.approvePayment);
projectRouter.post("/phase/:phaseId/complete", authorize, orgAuthorize, projectAuthorize, requiredRole(["ADMIN", "ENGINEER"]), phaseController.completePhase);
projectRouter.get("/paymentPendingPhases", authorize, orgAuthorize, requiredRole("ADMIN"), phaseController.getPaymentPendingPhases);

// --- 3. REQUISITION ROUTES ---
projectRouter.post("/phase/:phaseId/requisition", authorize, orgAuthorize, projectAuthorize, requiredRole(["ADMIN", "ENGINEER"]), requisitionController.createRequisition);
projectRouter.post("/requisition/:requisitionId/approve", authorize, orgAuthorize, projectAuthorize, requiredRole("ADMIN"), requisitionController.approveRequisition);
projectRouter.post("/requisition/:requisitionId/reject", authorize, orgAuthorize, projectAuthorize, requiredRole("ADMIN"), requisitionController.rejectRequisition);

// // We will add the multer middleware here to handle the max 5 image uploads
// projectRouter.post("/phase/sitelog", authorize, orgAuthorize, requiredRole(["ADMIN", "ENGINEER"]), projectAuthorize, uploadMiddleware, sitelogController.createSiteLog);

export default projectRouter;