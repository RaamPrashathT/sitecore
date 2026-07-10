import dotenv from "dotenv";

dotenv.config();

function required(key: string): string {
    const value = process.env[key]?.trim();
    if (!value) throw new Error(`Missing environment variable: ${key}`);
    return value;
}

function optional(key: string): string | undefined {
    return process.env[key]?.trim() || undefined;
}

const frontendUrl =
    optional("FRONTEND_URL") ??
    optional("CLIENT_ORIGIN")?.split(",")[0]?.trim() ??
    "http://localhost:5173";

export const env = {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: process.env.PORT || "5000",

    MONGODB_URL: required("MONGODB_URL"),
    DATABASE_URL: required("DATABASE_URL"),
    REDIS_URL: required("REDIS_URL"),

    // Comma-separated origins are supported, which is useful when both the
    // production Vercel URL and a preview/custom domain need access.
    CLIENT_ORIGINS: (optional("CLIENT_ORIGIN") ?? frontendUrl)
        .split(",")
        .map((origin) => origin.trim().replace(/\/$/, ""))
        .filter(Boolean),
    FRONTEND_URL: frontendUrl.replace(/\/$/, ""),

    GOOGLE_CLIENT_ID: optional("GOOGLE_CLIENT_ID"),
    GOOGLE_CLIENT_SECRET: optional("GOOGLE_CLIENT_SECRET"),
    GOOGLE_REDIRECT_URI: optional("GOOGLE_REDIRECT_URI"),
    RESEND_API_KEY: optional("RESEND_API_KEY"),
};
