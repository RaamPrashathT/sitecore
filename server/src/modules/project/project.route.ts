import { Router } from "express";
import { authorize } from "../../shared/middleware/authorize.middleware.js";
import { orgAuthorize } from "../../shared/middleware/orgAuthorize.middleware.js";
import { requiredRole } from "../../shared/middleware/requireRole.middleware.js";
import projectController from "./project.controller.js";

const projectRouter = Router();

projectRouter.post("/", authorize, orgAuthorize, requiredRole("ADMIN"), projectController.createProject)

projectRouter.get("/", authorize, orgAuthorize, requiredRole("ADMIN"), projectController.getProjects)

projectRouter.get("/:projectSlug", authorize, orgAuthorize, projectController.getProjectDetails)

projectRouter.post("/phase", authorize, orgAuthorize, requiredRole(["ADMIN", "ENGINEER"]), projectController.createPhase)

projectRouter.get("/phase", authorize, orgAuthorize, requiredRole(["ADMIN", "ENGINEER"]), projectController.getPhases) 

projectRouter.put("/phase/payment_approval", authorize, orgAuthorize, requiredRole("ADMIN"), projectController.paymentApproval)

export default projectRouter;