import dotenv from "dotenv";

dotenv.config();

function getEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
}

export const env = {
    NODE_ENV: process.env.NODE_ENV || "development",

    PORT: process.env.PORT || "5000",

    MONGODB_URL: getEnv("MONGODB_URL"),
    DATABASE_URL: getEnv("DATABASE_URL"),

    UPSTASH_REDIS_REST_URL: getEnv("UPSTASH_REDIS_REST_URL"),
    UPSTASH_REDIS_REST_TOKEN: getEnv("UPSTASH_REDIS_REST_TOKEN"),

    GOOGLE_CLIENT_ID: getEnv("GOOGLE_CLIENT_ID"),
    GOOGLE_CLIENT_SECRET: getEnv("GOOGLE_CLIENT_SECRET"),
    GOOGLE_REDIRECT_URI: getEnv("GOOGLE_REDIRECT_URI"),
};
