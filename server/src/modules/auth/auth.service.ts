import bcrypt from "bcryptjs";
import {
    User,
    VerificationToken,
} from "../../shared/models/user.js";
import type { RegisterInputSchema, LoginInputSchema } from "./auth.schema.js";
import { ConflictError } from "../../shared/error/conflict.error.js";
import { UnAuthorizedError } from "../../shared/error/unauthorized.error.js";
import crypto from "node:crypto";
import redis from "../../shared/lib/redis.js";
import { prisma } from "../../shared/lib/prisma.js";
import { generateOTP, hashOTP } from "../../shared/lib/otp.js";
import { sendVerificationEmail } from "../../shared/lib/emails/sendEmailVerification.js";
import { UnverifiedError } from "../../shared/error/unverified.error.js";
import { TwoFactorRequiredError } from "../../shared/error/twoFactor.error.js";

const authService = {
    async register(data: RegisterInputSchema) {
        if (data.inviteToken) {
            const invite = await prisma.invitation.findFirst({
                where: {
                    token: data.inviteToken,
                    status: "PENDING",
                    expiresAt: { gt: new Date() },
                },
            });
            
            if (!invite) {
                throw new UnAuthorizedError("Invalid or expired invite link");
            }   
            if (invite.email !== data.email) {
                throw new UnAuthorizedError(
                    "You must register with the exact email the invite was sent to.",
                );
            }
        }

        const existingUser = await User.findOne({ email: data.email });
        if (existingUser) {
            throw new ConflictError("User already exists. Please log in.");
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);
        const username = data.email.split("@")[0] as string;

        const newUser = await User.create({
            username,
            email: data.email,
            emailVerified: !!data.inviteToken,
            onboarded: false,
            accounts: [
                {
                    provider: "credentials",
                    providerAccountId: data.email,
                    password: hashedPassword,
                },
            ],
        });

        if (data.inviteToken) {
            const sessionId = crypto.randomBytes(32).toString("hex");

            return {
                frictionlessLogin: true,
                sessionId,
                user: newUser,
            };
        }

        const otp = generateOTP();
        const otpHash = hashOTP(otp);
        const verifyToken = crypto.randomBytes(32).toString("hex");

        await VerificationToken.findOneAndUpdate(
            { userId: newUser._id },
            {
                token: verifyToken,
                otpHash,
                email: newUser.email,
                expiresAt: new Date(Date.now() + 1000 * 60 * 10), // 10 min expiry
            },
            { upsert: true, new: true },
        );

        await sendVerificationEmail(newUser.email, otp);

        return {
            frictionlessLogin: false,
            token: verifyToken,
        };
    },

    async verifyOtp(token: string, otp: string) {
        const record = await VerificationToken.findOne({ token });
        if (!record) {
            throw new UnAuthorizedError(
                "Invalid or expired verification token.",
            );
        }

        const hashedOtp = hashOTP(otp);
        if (hashedOtp !== record.otpHash) {
            throw new UnAuthorizedError("Invalid OTP code.");
        }

        await User.updateOne(
            { _id: record.userId },
            { $set: { emailVerified: true } },
        );

        await VerificationToken.deleteOne({ _id: record._id });

        const verifiedUser = await User.findById(record.userId);
        if (!verifiedUser) throw new UnAuthorizedError("User not found.");

        const sessionId = crypto.randomBytes(32).toString("hex");

        return {
            sessionId,
            user: verifiedUser,
        };
    },

    async verify2fa(tempToken: string, otp: string) {
        const intentData = await redis.get(`2fa_intent:${tempToken}`);
        if (!intentData) {
            throw new UnAuthorizedError("Invalid or expired 2FA token. Please log in again.");
        }

        const { userId, otpHash } = JSON.parse(intentData);

        const hashedOtp = hashOTP(otp);
        if (hashedOtp !== otpHash) {
            throw new UnAuthorizedError("Invalid OTP code.");
        }

        await redis.del(`2fa_intent:${tempToken}`);

        const user = await User.findById(userId);
        if (!user) throw new UnAuthorizedError("User not found.");

        const sessionId = crypto.randomBytes(32).toString("hex");

        const tenant = await prisma.membership.findMany({
            where: { userId: user._id.toString() },
            select: {
                role: true,
                organization: {
                    select: {
                        id: true,
                        slug: true,
                        projects: {
                            where: {
                                assignments: {
                                    some: {
                                        userId: user._id.toString(),
                                        role: { in: ["CLIENT", "ENGINEER", "ADMIN"] },
                                    },
                                },
                            },
                            select: { id: true, slug: true },
                        },
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

        return {
            sessionId,
            user,
            tenant: formattedTenant,
        };
    },

    async login(data: LoginInputSchema) {
        const existingUser = await User.findOne({ email: data.email }).select(
            "+accounts.password",
        );

        if (!existingUser) {
            throw new UnAuthorizedError("Invalid email or password.");
        }

        const credentialAccount = existingUser.accounts.find(
            (acc) => acc.provider === "credentials",
        );

        if (!credentialAccount?.password) {
            throw new UnAuthorizedError("Please log in using Google OAuth.");
        }

        const isPasswordValid = await bcrypt.compare(
            data.password,
            credentialAccount.password,
        );

        if (!isPasswordValid) {
            throw new UnAuthorizedError("Invalid email or password.");
        }

        let isInvitedLogin = false;
        if (data.inviteToken) {
            const invite = await prisma.invitation.findFirst({
                where: {
                    token: data.inviteToken,
                    status: "PENDING",
                    expiresAt: { gt: new Date() },
                },
            });
            if (invite?.email === existingUser.email) {
                isInvitedLogin = true;
                if (!existingUser.emailVerified) {
                    await User.updateOne(
                        { _id: existingUser._id },
                        { $set: { emailVerified: true } },
                    );
                    existingUser.emailVerified = true;
                }
            }
        }

        if (!existingUser.emailVerified && !isInvitedLogin) {
            const otp = generateOTP();
            const otpHash = hashOTP(otp);
            const verifyToken = crypto.randomBytes(32).toString("hex");

            await VerificationToken.findOneAndUpdate(
                { userId: existingUser._id },
                {
                    token: verifyToken,
                    otpHash,
                    email: existingUser.email,
                    expiresAt: new Date(Date.now() + 1000 * 60 * 10),
                },
                { upsert: true, new: true },
            );

            await sendVerificationEmail(existingUser.email, otp);
            throw new UnverifiedError(verifyToken);
        }

        if (!isInvitedLogin && (existingUser as any).isTwoFactorEnabled) {
            const otp = generateOTP();
            const otpHash = hashOTP(otp);
            const temp2faToken = crypto.randomBytes(32).toString("hex");

            await redis.set(
                `2fa_intent:${temp2faToken}`,
                JSON.stringify({ userId: existingUser._id, otpHash }),
                { EX: 300 },
            );

            await sendVerificationEmail(existingUser.email, otp); 
            throw new TwoFactorRequiredError(temp2faToken);
        }

        const sessionId = crypto.randomBytes(32).toString("hex");

        const tenant = await prisma.membership.findMany({
            where: {
                userId: existingUser._id.toString(),
            },
            select: {
                role: true,
                organization: {
                    select: {
                        id: true,
                        slug: true,
                        projects: {
                            where: {
                                assignments: {
                                    some: {
                                        userId: existingUser._id.toString(),
                                        role: { in: ["CLIENT", "ENGINEER", "ADMIN"] },
                                    },
                                },
                            },
                            select: {
                                id: true,
                                slug: true,
                            },
                        },
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
        return {
            sessionId,
            user: existingUser,
            tenant: formattedTenant,
            frictionlessLogin: isInvitedLogin
        };
    },

    async resendVerificationOtp(email: string) {
        const existingUser = await User.findOne({ email });
        if (!existingUser) return;
        if (existingUser.emailVerified) return;

        const otp = generateOTP();
        const otpHash = hashOTP(otp);
        const verifyToken = crypto.randomBytes(32).toString("hex");

        await VerificationToken.findOneAndUpdate(
            { userId: existingUser._id },
            {
                token: verifyToken,
                otpHash,
                email: existingUser.email,
                expiresAt: new Date(Date.now() + 1000 * 60 * 10),
            },
            { upsert: true, new: true },
        );

        await sendVerificationEmail(existingUser.email, otp);
        return verifyToken;
    },

    async googleLogin(inviteToken?: string) {
        const state = crypto.randomBytes(32).toString("hex");
        const codeVerifier = crypto.randomBytes(64).toString("base64url");

        const codeChallenge = crypto
            .createHash("sha256")
            .update(codeVerifier)
            .digest("base64url");

        await redis.set(
            `oauth_state:${state}`,
            JSON.stringify({ codeVerifier, inviteToken }),
            { EX: 600 },
        );
        const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
        const options = {
            redirect_uri: process.env.GOOGLE_REDIRECT_URI as string,
            client_id: process.env.GOOGLE_CLIENT_ID as string,
            access_type: "offline",
            response_type: "code",
            prompt: "consent",
            scope: ["openid", "email", "profile"].join(" "),
            state: state,
            code_challenge: codeChallenge,
            code_challenge_method: "S256",
        };

        const qs = new URLSearchParams(options).toString();

        return `${rootUrl}?${qs}`;
    },
};

export default authService;
