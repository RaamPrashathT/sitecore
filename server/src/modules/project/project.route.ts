import { Router } from "express";
import { authorize } from "../../shared/middleware/authorize.middleware";
import { orgAuthorize } from "../../shared/middleware/orgAuthorize.middleware";
import { requiredRole } from "../../shared/middleware/requireRole.middleware";
import projectController from "./project.controller";

const projectRouter = Router();

projectRouter.post("/", authorize, orgAuthorize, requiredRole("ADMIN"), projectController.createProject)

projectRouter.get("/", authorize, orgAuthorize, requiredRole("ADMIN"), projectController.getProjects)

export default projectRouter;