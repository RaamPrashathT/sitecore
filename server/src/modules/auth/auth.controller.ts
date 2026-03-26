import type { Request, Response } from "express";
import authService from "./auth.service.js";
import { logger } from "../../shared/lib/logger.js";
import { ConflictError } from "../../shared/error/conflict.error.js";
import redis from "../../shared/lib/redis.js";
import { UnAuthorizedError } from "../../shared/error/unauthorized.error.js";
import { ProfileSchema } from "./auth.schema.js";
import z from "zod";
import { User } from "../../shared/models/user.js";
import crypto from "node:crypto";
import { prisma } from "../../shared/lib/prisma.js";
import { UnverifiedError } from "../../shared/error/unverified.error.js";
import { env } from "../../shared/config/env.js";
import { ValidationError } from "../../shared/error/validation.error.js";
import { TwoFactorRequiredError } from "../../shared/error/twoFactor.error.js";

type ProfileSchema = {
    sub: string;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
    email: string;
    email_verified: boolean;
};

const authController = {
    async register(request: Request, response: Response) {
        try {
            const result = await authService.register(request.body);
            if (result.frictionlessLogin && result.sessionId && result.user) {
                await redis.set(
                    `session:${result.sessionId}`,
                    JSON.stringify({
                        userId: result.user._id,
                        email: result.user.email,
                        username: result.user.username,
                        onboarded: result.user.onboarded,
                        tenant: {},
                    }),
                    { EX: 60 * 60 * 24 },
                );

                response.cookie("session", result.sessionId, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "none",
                    maxAge: 1000 * 60 * 60 * 24,
                });

                return response.status(200).json({
                    message: "Registered and auto-verified via invite.",
                    frictionlessLogin: true,
                });
            }

            return response.status(200).json({
                message: "OTP sent to email.",
                frictionlessLogin: false,
                token: result.token,
            });
        } catch (error) {
            if (
                error instanceof ConflictError ||
                (error as any).code === 11000
            ) {
                return response.status(409).json({
                    message: "User already exists. Please log in.",
                });
            }
            if (error instanceof UnAuthorizedError) {
                return response.status(403).json({
                    message: error.message,
                });
            }
            logger.error("Registration Error:", error);
            return response.status(500).json({
                message: "Internal server error",
            });
        }
    },

    async verifyOtp(request: Request, response: Response) {
        try {
            const { token, otp } = request.body;
            if (!token || !otp) {
                throw new ValidationError("Token and OTP are required.");
            }
            const { sessionId, user } = await authService.verifyOtp(token, otp);

            await redis.set(
                `session:${sessionId}`,
                JSON.stringify({
                    userId: user._id,
                    email: user.email,
                    username: user.username,
                    onboarded: user.onboarded,
                    tenant: {},
                }),
                { EX: 60 * 60 * 24 },
            );

            response.cookie("session", sessionId, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                maxAge: 1000 * 60 * 60 * 24,
            });

            return response.status(200).json({
                message: "OTP verified successfully",
            });
        } catch (error) {
            if (error instanceof ValidationError) {
                return response.status(400).json({
                    message: error.message,
                });
            }
            if (error instanceof UnAuthorizedError) {
                return response.status(400).json({
                    message: error.message,
                });
            }
            logger.error("OTP Verification Error:", error);
            return response.status(500).json({
                message: "Internal server error",
            });
        }
    },

    async login(request: Request, response: Response) {
        try {
            const { sessionId, user, tenant } = await authService.login(
                request.body,
            );

            await redis.set(
                `session:${sessionId}`,
                JSON.stringify({
                    userId: user._id,
                    email: user.email,
                    username: user.username,
                    onboarded: user.onboarded,
                    tenant: tenant,
                }),
                { EX: 60 * 60 * 24 },
            );

            response.cookie("session", sessionId, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                maxAge: 1000 * 60 * 60 * 24,
            });

            return response.status(200).json({
                message: "User logged in successfully",
            });
        } catch (error) {
            if (error instanceof UnverifiedError) {
                console.log(error);
                return response.status(403).json({
                    code: "EMAIL_NOT_VERIFIED",
                    message: "OTP sent to your email",
                    verificationToken: error.message,
                });
            }
            if (error instanceof TwoFactorRequiredError) {
                return response.status(403).json({
                    code: "2FA_REQUIRED",
                    message: "Two-step verification required.",
                    tempToken: error.tempToken,
                });
            }
            if (error instanceof UnAuthorizedError) {
                return response.status(401).json({
                    code: "INVALID_CREDENTIALS",
                    message: "Invalid email or password",
                });
            }

            logger.error(error);

            return response.status(500).json({
                code: "INTERNAL_ERROR",
                message: "Internal server error",
            });
        }
    },

    async resendVerification(request: Request, response: Response) {
        try {
            const { email } = request.body;
            if (!email) throw new Error("Email is required");

            const newToken = await authService.resendVerificationOtp(email);

            return response.status(200).json({
                message:
                    "If the email is registered and unverified, a new OTP has been sent.",
                verificationToken: newToken || null,
            });
        } catch (error) {
            logger.error("Resend OTP Error:", error);
            return response.status(500).json({
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
                secure: true,
                sameSite: "none",
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
            });
        }
    },

    async google(request: Request, response: Response) {
        try {
            const inviteToken = request.query.inviteToken as string;
            const redirectUrl = await authService.googleLogin(inviteToken);
            return response.redirect(redirectUrl);
        } catch (error) {
            logger.error(error);
        }
    },

    async googleCallback(request: Request, response: Response) {
        try {
            const { code, state } = request.query;
            const savedStateData = await redis.get(
                `oauth_state:${state as string}`,
            );

            if (!savedStateData) {
                return response
                    .status(400)
                    .send("State mismatch or session expired.");
            }
            const { codeVerifier, inviteToken } = JSON.parse(savedStateData);

            await redis.del(`oauth_state:${state as string}`);

            const tokenResponse = await fetch(
                "https://oauth2.googleapis.com/token",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        code,
                        client_id: process.env.GOOGLE_CLIENT_ID,
                        client_secret: process.env.GOOGLE_CLIENT_SECRET,
                        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
                        grant_type: "authorization_code",
                        code_verifier: codeVerifier,
                    }),
                },
            );

            if (!tokenResponse.ok) throw new Error("Failed to exchange code");
            const tokens: any = await tokenResponse.json();

            const userResponse = await fetch(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                { headers: { Authorization: `Bearer ${tokens.access_token}` } },
            );

            const profile = await userResponse.json();
            const validatedProfile = ProfileSchema.safeParse(profile);

            if (!validatedProfile.success) {
                return response.status(400).json({
                    success: false,
                    message: "Invalid profile data",
                    errors: z.flattenError(validatedProfile.error).fieldErrors,
                });
            }

            const existingGoogleUser = await User.findOne({
                accounts: {
                    $elemMatch: {
                        provider: "google",
                        providerAccountId: validatedProfile.data.sub,
                    },
                },
            });

            const existingUser = await User.findOne({
                email: validatedProfile.data.email,
            });

            if (inviteToken) {
                const invite = await prisma.clientInvitation.findFirst({
                    where: { token: inviteToken, status: "PENDING" },
                });
                if (invite && invite.email !== validatedProfile.data.email) {
                    const frontendUrl =
                        process.env.FRONTEND_URL || "http://localhost:5173";
                    return response.redirect(
                        `${frontendUrl}/login?error=account_mismatch&expected=${invite.email}`,
                    );
                }
            }

            let user;

            if (existingGoogleUser) {
                user = existingGoogleUser;
            } else if (existingUser) {
                existingUser.accounts.push({
                    provider: "google",
                    providerAccountId: validatedProfile.data.sub,
                });
                await existingUser.save();
                user = existingUser;
            } else {
                user = await User.create({
                    email: validatedProfile.data.email,
                    username: validatedProfile.data.name,
                    emailVerified: true,
                    onboarded: false,
                    accounts: [
                        {
                            provider: "google",
                            providerAccountId: validatedProfile.data.sub,
                        },
                    ],
                });
            }

            const sessionId = crypto.randomBytes(32).toString("hex");

            const tenant = await prisma.membership.findMany({
                where: { userId: user._id.toString() },
                select: {
                    role: true,
                    organization: {
                        select: {
                            id: true,
                            slug: true,
                        },
                    },
                },
            });

            const formattedTenant = tenant.reduce(
                (acc, item) => {
                    acc[item.organization.slug] = {
                        id: item.organization.id,
                        role: item.role,
                    };
                    return acc;
                },
                {} as Record<string, { id: string; role: string }>,
            );

            await redis.set(
                `session:${sessionId}`,
                JSON.stringify({
                    userId: user._id,
                    email: user.email,
                    username: user.username,
                    onboarded: user.onboarded,
                    tenant: formattedTenant,
                }),
                { EX: 60 * 60 * 24 },
            );

            response.cookie("session", sessionId, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                maxAge: 1000 * 60 * 60 * 24,
            });

            const frontendUrl =
                process.env.FRONTEND_URL || "http://localhost:5173";
            if (inviteToken) {
                return response.redirect(
                    `${frontendUrl}/invitation?token=${inviteToken}`,
                );
            }
            return response.redirect(`${frontendUrl}/organizations`);
        } catch (error) {
            logger.error(error);
            const frontendUrl =
                process.env.FRONTEND_URL || "http://localhost:5173";
            return response.redirect(`${frontendUrl}/login?error=oauth_failed`);
        }
    },
};

export default authController;
