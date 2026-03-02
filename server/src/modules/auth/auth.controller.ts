import type { Request, Response } from "express";
import authService from "./auth.service.js";
import { logger } from "../../shared/lib/logger.js";
import { ConflictError } from "../../shared/error/conflict.error.js";
import redis from "../../shared/lib/redis.js";
import { UnAuthorizedError } from "../../shared/error/unauthorized.error.js";

const authController = {
    async register(request: Request, response: Response) {
        try {
            const result = await authService.register(request.body);
            if (result.success) {
                return response.status(200).json({
                    success: true,
                    message: "User created successfully",
                });
            }
            logger.error("Something went wrong");
            return response.status(500).json({
                success: false,
                message: "Internal server error",
            });
        } catch (error) {
            if (
                error instanceof ConflictError ||
                (error as any).code === 11000
            ) {
                return response.status(400).json({
                    success: false,
                    message: "User already exists",
                });
            }
            logger.error(error);
            return response.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    },

    async login(request: Request, response: Response) {
        try {
            const { sessionId, userId } = await authService.login(request.body);

            await redis.set(
                `session:${sessionId}`,
                JSON.stringify({
                    userId: userId,
                    userAgent: request.headers["user-agent"],
                }),
                { ex: 60 * 60 * 24 },
            );

            response.cookie("session", sessionId, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 1000 * 60 * 60 * 24,
            });

            return response.status(200).json({
                success: true,
                message: "User logged in successfully",
            });
        } catch (error) {
            if (error instanceof UnAuthorizedError) {
                return response.status(401).json({
                    success: false,
                    message: error.message,
                });
            }
            logger.error(error);
            return response.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    },

    async logout(request: Request, response: Response) {
        try {
            const sessionId = request.cookies.session;

            if (!sessionId) {
                return response.status(400).json({
                    success: false,
                    message: "No token found",
                });
            }

            await redis.del(`session:${sessionId}`);

            response.clearCookie("session", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
            });

            return response.status(200).json({
                success: true,
                message: "User logged out successfully",
            });
        } catch (error) {
            logger.error(error);
            return response.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    },

    async me(request: Request, response: Response) {
        try {
            return response.status(200).json({
                success: true,
                message: "User found",
                data: request.session,
            });
        } catch (error) {
            logger.error(error);
            return response.status(500).json({
                success: false,
                message: "Internal server error",
            })
        }
    },

    async google(request: Request, response: Response) {
        try {
            const redirectUrl = await authService.googleLogin();
            return response.redirect(redirectUrl);
        } catch (error) {
            logger.error(error);
        }
    }
};

export default authController;
