import { Router } from "express";
import { LoginSchema, RegisterSchema } from "./auth.schema.js";
import { validate } from "../../shared/middleware/validate.middleware.js";
import authController from "./auth.controller.js";
import { authorize } from "../../shared/middleware/authorize.middleware.js";

const authRouter = Router();

authRouter.post('/register', validate(RegisterSchema), authController.register)

authRouter.post('/login', validate(LoginSchema), authController.login)

authRouter.post('/logout', authController.logout)

authRouter.post('/me', authorize, authController.me)

authRouter.get('/google', authController.google)

// authRouter.get('/google/callback', authController.googleCallback)

export default authRouter;