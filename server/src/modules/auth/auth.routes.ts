import { Router } from "express";
import { LoginSchema, RegisterSchema } from "./auth.schema.js";
import { validate } from "../../shared/middleware/validate.middleware.js";
import authController from "./auth.controller.js";

const authRouter = Router();

authRouter.post('/register', validate(RegisterSchema), authController.register)

authRouter.post('/login', validate(LoginSchema), authController.login)

export default authRouter;