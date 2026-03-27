import { Router } from "express";
import { authorize } from "../../shared/middleware/authorize.middleware.js";
import { validate } from "../../shared/middleware/validate.middleware.js";
import { OnboardingSchema } from "./user.schema.js";
import userController from "./user.controller.js";
import { loadSession } from "../../shared/middleware/loadSession.middleware.js";

const userRouter = Router();

userRouter.get("/invitation-details", loadSession, userController.getInvitationDetails);

userRouter.post("/onboard", authorize, validate(OnboardingSchema), userController.onboard);

userRouter.get("/provision", authorize, userController.provision);

userRouter.post("/accept-invitation", authorize, userController.acceptInvite);

userRouter.post("/decline-invitation", authorize, userController.declineInvite);

export default userRouter;