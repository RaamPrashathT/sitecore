import type { Request, Response } from "express";
import authService from "./auth.service.js";
import { logger } from "../../shared/lib/logger.js";
import { ConflictError } from "../../shared/error/conflict.error.js";
import redis from "../../shared/lib/redis.js";
import { UnAuthorizedError } from "../../shared/error/unauthorized.error.js";
import { env } from "../../shared/config/env.js";
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
};

export default authController;
