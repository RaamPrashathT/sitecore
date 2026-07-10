import { createClient } from "redis";
import { env } from "../config/env.js";
import { logger } from "./logger.js";

const redis = createClient({
    url: env.REDIS_URL,
    socket: {
        connectTimeout: 10_000,
        reconnectStrategy: (retries) => Math.min(retries * 100, 3_000),
    },
});

redis.on("error", (error) => logger.error(`Redis client error: ${error}`));

export async function connectRedis() {
    if (!redis.isOpen) await redis.connect();
    logger.info("Connected to Redis successfully");
}

export async function disconnectRedis() {
    if (redis.isOpen) await redis.quit();
}

export default redis;
