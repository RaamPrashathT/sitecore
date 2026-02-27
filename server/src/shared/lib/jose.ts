import { jwtVerify, SignJWT } from "jose";
import { tokenSchema } from "./types.js";


type TokenType = "access" | "refresh";

export const createAccessToken = async (payload: { userId: string, email: string, tokenType: TokenType}) => {
    const access_secret = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);

    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("10m")
        .sign(access_secret);
}

export const createRefreshToken = async (payload: { userId: string, email: string, tokenType: TokenType}) => {
    const refresh_secret = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET);

    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(refresh_secret);
}

export const verifyAccessToken = async (token: string) => {
    const access_secret = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);
    try {
        const { payload } = await jwtVerify(token, access_secret);
        
        const parsed = tokenSchema.safeParse(payload);
        if(!parsed.success) {
            throw new Error("Invalid token payload");
        }
        if (parsed.data.exp && Date.now() >= parsed.data.exp * 1000) {
            throw new Error("Access token expired");
        }
        return parsed.data;
    } catch (error) {
        throw new Error("Invalid access token: " + error);
    }
}

export const verifyRefreshToken = async (token: string) => {
    const refresh_secret = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET);

    try {
        const { payload } = await jwtVerify(token, refresh_secret);
        const parsed = tokenSchema.safeParse(payload);
        if(!parsed.success) {
            throw new Error("Invalid token payload");
        }
        if (parsed.data.exp && Date.now() >= parsed.data.exp * 1000) {
            throw new Error("Refresh token expired");
        }
        return parsed.data;
    } catch (error) {
        console.error("Error verifying refresh token:", error);
        throw new Error("Invalid refresh token: " + error);
    }
}

