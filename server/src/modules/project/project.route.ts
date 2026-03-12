import { Router } from "express";
import { authorize } from "../../shared/middleware/authorize.middleware.js";
import { orgAuthorize } from "../../shared/middleware/orgAuthorize.middleware.js";
import { requiredRole } from "../../shared/middleware/requireRole.middleware.js";
import projectController from "./project.controller.js";
import { projectAuthorize } from "../../shared/middleware/projectAuthorize.middleware.js";

const projectRouter = Router();

projectRouter.post("/", authorize, orgAuthorize, requiredRole("ADMIN"), projectController.createProject)

projectRouter.get("/", authorize, orgAuthorize, requiredRole("ADMIN"), projectController.getProjects)

projectRouter.post("/phase", authorize, orgAuthorize, requiredRole(["ADMIN", "ENGINEER"]),projectAuthorize, projectController.createPhase)

projectRouter.get("/phase", authorize, orgAuthorize, requiredRole(["ADMIN", "ENGINEER"]), projectAuthorize, projectController.getPhases) 

projectRouter.put("/phase/payment_approval", authorize, orgAuthorize, requiredRole("ADMIN"), projectController.paymentApproval)

projectRouter.post("/phase/requisition", authorize, orgAuthorize, requiredRole(["ADMIN", "ENGINEER"]), projectAuthorize, projectController.createRequisition)

projectRouter.post("/phase/requisitionItems", authorize, orgAuthorize, requiredRole(["ADMIN", "ENGINEER"]), projectAuthorize, projectController.createRequistionItems)

projectRouter.get("/:projectSlug", authorize, orgAuthorize, projectController.getProjectDetails)

export default projectRouter;