import bcrypt from "bcryptjs";
import { User } from "../../shared/models/user.js";
import type { RegisterInputSchema, LoginInputSchema } from "./auth.schema.js";
import generateName from "../../shared/lib/fantastical.js";
import { ConflictError } from "../../shared/error/conflict.error.js";
import { UnAuthorizedError } from "../../shared/error/unauthorized.error.js";
import crypto from "node:crypto";
import redis from "../../shared/lib/redis.js";

const authService = {
    async register(data: RegisterInputSchema) {
        const existingUser = await User.findOne({ email: data.email });

        if (existingUser) {
            const isCredentialAccount = existingUser.accounts.some(
                (account) => account.provider === "credentials",
            );

            if (isCredentialAccount) {
                throw new ConflictError("User already exists");
            }

            const hashedPassword = await bcrypt.hash(data.password, 10);

            await User.findOneAndUpdate(
                { email: data.email },
                {
                    $addToSet: {
                        accounts: {
                            provider: "credentials",
                            providerAccountId: data.email,
                            password: hashedPassword,
                        },
                    },
                },
            );

            return {
                success: true,
            };
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);
        const randomName = generateName();

        await User.create({
            username: randomName,
            email: data.email,
            accounts: [
                {
                    provider: "credentials",
                    providerAccountId: data.email,
                    password: hashedPassword,
                },
            ],
        });

        return {
            success: true,
        };
    },

    async login(data: LoginInputSchema) {
        const existingUser = await User.findOne({ email: data.email }).select(
            "+accounts.password",
        );

        if (!existingUser) {
            throw new UnAuthorizedError();
        }

        const password = existingUser.accounts.find(
            (account) => account.provider === "credentials",
        )?.password;

        if (!password) {
            throw new UnAuthorizedError();
        }

        const isPasswordValid = await bcrypt.compare(data.password, password);

        if (!isPasswordValid) {
            throw new UnAuthorizedError();
        }

        const sessionId = crypto.randomBytes(32).toString("hex");

        return {
            sessionId,
            userId: existingUser._id,
        };
    },

    async googleLogin() {
        const state = crypto.randomBytes(32).toString("hex");
        const codeVerifier = crypto.randomBytes(64).toString("base64url");

        const codeChallenge = crypto
            .createHash("sha256")
            .update(codeVerifier)
            .digest("base64url");

        await redis.set(`oauth_state:${state}`, codeVerifier, { ex: 600 });

        const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
        const options = {
            redirect_uri: process.env.GOOGLE_REDIRECT_URI as string,
            client_id: process.env.GOOGLE_CLIENT_ID as string,
            access_type: 'offline',
            response_type: 'code',
            prompt: 'consent',
            scope: ['openid', 'email', 'profile'].join(' '),
            state: state,
            code_challenge: codeChallenge,
            code_challenge_method: 'S256',
        };

        const qs = new URLSearchParams(options).toString();

        return `${rootUrl}?${qs}`;
    },
};

export default authService;
