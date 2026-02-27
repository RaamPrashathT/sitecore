import { Router } from "express";
import { validate } from "../../shared/middleware/validate.middleware.js";
import { loginSchema, registerSchema } from "./auth.schema.js";
import AuthController from "./auth.controller.js";

const authRouter = Router();

authRouter.post('/register', validate(registerSchema), AuthController.register)

authRouter.post('/login', validate(loginSchema), AuthController.login)

// authRouter.get('/me')

// authRouter.post('/logout')

// // OAuth Routes

// authRouter.get('/google')

// authRouter.get('/google/callback')

export default authRouter;