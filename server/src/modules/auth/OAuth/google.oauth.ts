import {
    createAccessToken,
    createRefreshToken,
} from "../../../shared/lib/jose.js";
import redis from "../../../shared/lib/redis.js";
import { User } from "../../../shared/models/user.js";
import { ProfileSchema } from "../auth.schema.js";
import type { Request, Response } from "express";
import { z } from "zod";

type ProfileSchema = {
    sub: string;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
    email: string;
    email_verified: boolean;
};

export const OAuthGoogleCallback = async (
    request: Request,
    response: Response,
) => {
    const { code, state } = request.query;

    const savedCodeVerifier = await redis.get<string>(
        `oauth_state:${state as string}`,
    );

    if (!savedCodeVerifier) {
        return response
            .status(400)
            .send("State mismatch or session expired. Possible CSRF attack.");
    }

    await redis.del(`oauth_state:${state as string}`);

    try {
        const tokenResponse = await fetch(
            "https://oauth2.googleapis.com/token",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    code,
                    client_id: process.env.GOOGLE_CLIENT_ID,
                    client_secret: process.env.GOOGLE_CLIENT_SECRET,
                    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
                    grant_type: "authorization_code",
                    code_verifier: savedCodeVerifier,
                }),
            },
        );

        const tokens: any = await tokenResponse.json();

        if (!tokenResponse.ok) {
            throw new Error("Failed to exchange code");
        }

        const userResponse = await fetch(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            {
                headers: { Authorization: `Bearer ${tokens.access_token}` },
            },
        );

        const profile = await userResponse.json();

        const validatedProfile = ProfileSchema.safeParse(profile);
        if (!validatedProfile.success) {
            return response.status(400).json({
                success: false,
                message: "Invalid profile data",
            });
        }

        // Regular Authentication

        const existingUser = await User.findOne({
            email: validatedProfile.data.email,
        });

        const existingGoogleUser = existingUser?.accounts.some(
            (account) => account.provider === "google",
        );

        let user;
        try {
            if (existingGoogleUser) {
                user = existingUser;
            } else {
                if (existingUser) {
                    await User.findOneAndUpdate(
                        { email: existingUser.email },
                        {
                            $push: {
                                accounts: {
                                    provider: "google",
                                    providerAccountId: validatedProfile.data.email,
                                },
                            },
                        },
                    );
                    user = existingUser;
                } else {
                    user = User.create({
                        username: validatedProfile.data.name,
                        email: validatedProfile.data.email,
                        accounts: [
                            {
                                provider: "google",
                                providerAccountId: validatedProfile.data.email,
                            },
                        ],
                    })
                }
            }
            const accessToken = await createAccessToken({
                userId: user._id,
                email: user.email,
                tokenType: "access",
            });

            const refreshToken = await createRefreshToken({
                userId: user._id,
                email: user.email,
                tokenType: "refresh",
            });

            response.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                maxAge: 10 * 60 * 1000,
                path: "/",
            });

            response.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000,
                path: "/",
            });

            return response.redirect("http://localhost:5173/dashboard");
        } catch (error) {
            return response.status(500).json({
                success: false,
                message: "Database error: " + error,
            });
        }
    } catch (error) {
        return response.status(500).json({
            success: false,
            message: "Failed to exchange code: " + error,
        });
    }
};

// {
//   sub: '104912143705599335569',
//   name: 'Raam Prashath T',
//   given_name: 'Raam Prashath',
//   family_name: 'T',
//   picture: 'https://lh3.googleusercontent.com/a/ACg8ocIaALkylD0ueTaek9NqsJfC8P4HcwGIj0pfOIvCAGqpqVHTfQ=s96-c',
//   email: 'raamthiruna@gmail.com',
//   email_verified: true
// }
