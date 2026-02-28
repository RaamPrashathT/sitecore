import type { Request, Response } from "express";
import AuthService from "./auth.service.js";
import type { LoginInput, RegisterInput } from "./auth.schema.js";
import { createAccessToken, verifyRefreshToken } from "../../shared/lib/jose.js";

const AuthController = {
    async register(request: Request, response: Response) {
        try {
            const result = await AuthService.register(
                request.body as RegisterInput,
            );
            if (result.message === "LINKED") {
                return response.status(200).json({
                    success: true,
                    message: "Account linked with existing email",
                });
            }
            if (result.message === "CREATED") {
                return response.status(201).json({
                    success: true,
                    message: "Account created",
                });
            }
            return response.status(400).json({
                    success: false,
                    message: "Account already exists",
                });
        } catch (error) {
            if (error instanceof Error && error.message === "EXISTS") {
                return response.status(400).json({
                    success: false,
                    message: "Account already exists",
                });
            } 
            return response.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    },

    async login(request: Request, response: Response) {
        try {
            const {accessToken, refreshToken} = await AuthService.login(
                request.body as LoginInput,
            );

            response.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000,
                path: "/",
            });

            response.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                maxAge: 15 * 60 * 1000,
                path: "/",
            });

            return response.status(200).json({
                success: true,
                message: "Login successful",
            });

        } catch (error) {
            if(error instanceof Error && error.message === "INVALID") {
                return response.status(401).json({
                    success: false,
                    message: "Invalid credentials",
                })
            }

            return response.status(500).json({
                success: false,
                message: "Internal server error",
            })
        }
    },

    async refresh(request: Request, response: Response) {
        try {
            const refreshToken = request.cookies.refreshToken;
            if (!refreshToken) {
                return response.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });   
            }
            const isVerified = await verifyRefreshToken(refreshToken);
            if (!isVerified) {
                return response.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }
            const accessToken = await createAccessToken({
                userId: isVerified.userId,
                email: isVerified.email,
                tokenType: "access",
            });
            response.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                maxAge: 15 * 60 * 1000,
                path: "/",
            });
            return response.status(200).json({
                success: true,
                message: "Access token refreshed",
            });
        } catch(error){
            return response.status(500).json({
                success: false,
                message: "Internal server error: " + error,
            })
        }
    },

    async me(request: Request, response: Response) {
        return response.status(200).json({
            success: true,
            message: "Authorized",
        })
    },

    async logout(request: Request, response: Response) {
        try {
            response.clearCookie("refreshToken", {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                path: "/",
            });

            response.clearCookie("accessToken", {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                path: "/",
            });
            return response.status(200).json({
                success: true,
                message: "Logout successful",
            });
        } catch (error) {
            return response.status(500).json({
                success: false,
                message: "Internal server error: " + error,
            })
        }
    }
};


export default AuthController;
