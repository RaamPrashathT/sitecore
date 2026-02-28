import { Router } from "express";
import { validate } from "../../shared/middleware/validate.middleware.js";
import { loginSchema, registerSchema } from "./auth.schema.js";
import AuthController from "./auth.controller.js";
import { authorize } from "../../shared/middleware/authorize.middleware.js";
import { OAuthController } from "./OAuth/oauth.controller.js";
import { OAuthGoogleCallback } from "./OAuth/google.oauth.js";

const authRouter = Router();

authRouter.post('/register', validate(registerSchema), AuthController.register)

authRouter.post('/login', validate(loginSchema), AuthController.login)

authRouter.get('/me', authorize, AuthController.me)

authRouter.post('/refresh', AuthController.refresh)

authRouter.post('/logout', AuthController.logout)


// // OAuth Routes

authRouter.get('/google', OAuthController.google); 

authRouter.get('/google/callback', OAuthGoogleCallback);

export default authRouter;