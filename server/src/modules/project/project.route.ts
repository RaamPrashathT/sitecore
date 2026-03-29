import { Router } from "express";
import { authorize } from "../../shared/middleware/authorize.middleware.js";
import { orgAuthorize } from "../../shared/middleware/orgAuthorize.middleware.js";
import { requiredRole } from "../../shared/middleware/requireRole.middleware.js";
import { projectAuthorize } from "../../shared/middleware/projectAuthorize.middleware.js";

// Import the split controllers
import coreController from "./core/core.controller.js";
// import phaseController from "./phase/phase.controller.js";
// import requisitionController from "./requisition/requisition.controller.js";
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

// --- 2. PHASE ROUTES ---
// projectRouter.post("/phase", authorize, orgAuthorize, requiredRole(["ADMIN", "ENGINEER"]), projectAuthorize, phaseController.createPhase);
// projectRouter.get("/phase", authorize, orgAuthorize, projectAuthorize, phaseController.getPhases);
// projectRouter.put("/phase/payment_approval", authorize, orgAuthorize, requiredRole("ADMIN"), phaseController.paymentApproval);
// projectRouter.get("/paymentPendingPhases", authorize, orgAuthorize, requiredRole("ADMIN"), phaseController.getPaymentPendingPhases);

// // --- 3. REQUISITION ROUTES ---
// projectRouter.post("/phase/requisition", authorize, orgAuthorize, requiredRole(["ADMIN", "ENGINEER"]), projectAuthorize, requisitionController.createRequisition);
// projectRouter.post("/phase/requisitionItems", authorize, orgAuthorize, requiredRole(["ADMIN", "ENGINEER"]), projectAuthorize, requisitionController.postRequisitionItems);
// projectRouter.get("/pendingRequisitions", authorize, orgAuthorize, requiredRole("ADMIN"), requisitionController.getPendingRequisitions);
// projectRouter.get("/phase/requisition/:requisitionIdSlug", authorize, orgAuthorize, projectAuthorize, requisitionController.getRequisitionDetails);
// projectRouter.post("/phase/approveRequisition", authorize, orgAuthorize, requiredRole("ADMIN"), requisitionController.approveRequisition);
// projectRouter.post("/phase/rejectRequisition", authorize, orgAuthorize, requiredRole("ADMIN"), requisitionController.rejectRequisition);

// // We will add the multer middleware here to handle the max 5 image uploads
// projectRouter.post("/phase/sitelog", authorize, orgAuthorize, requiredRole(["ADMIN", "ENGINEER"]), projectAuthorize, uploadMiddleware, sitelogController.createSiteLog);

export default projectRouter;