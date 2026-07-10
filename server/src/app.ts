import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectMongoDB, disconnectMongoDB } from "./shared/lib/mongo.js";
import { connectRedis, disconnectRedis } from "./shared/lib/redis.js";
import { env } from "./shared/config/env.js";
import authRouter from "./modules/auth/auth.routes.js";
import orgRouter from "./modules/organization/organization.routes.js";
import catalogueRouter from "./modules/catalogue/catalogue.route.js";
import engRouter from "./modules/engineers/engineers.route.js";
import clientRouter from "./modules/clients/clients.route.js";
import { logger } from "./shared/lib/logger.js";
import projectRouter from "./modules/project/project.route.js";
import dashboardRouter from "./modules/dashboard/dashboard.route.js";
import pendingRouter from "./modules/pending/pending.routes.js";
import userRouter from "./modules/user/user.route.js";
import { traceMiddleware } from "./shared/middleware/trace.middleware.js";
import { responseTimeMiddleware } from "./shared/middleware/responseTime.middleware.js";

const app = express();
app.set("trust proxy", 1);

const isAllowedOrigin = (origin: string) => {
    const normalized = origin.replace(/\/$/, "");
    return (
        env.CLIENT_ORIGINS.includes(normalized) ||
        /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(normalized)
    );
};

app.use(
    cors({
        origin(origin, callback) {
            if (!origin || isAllowedOrigin(origin)) return callback(null, true);
            return callback(new Error(`Origin ${origin} is not allowed by CORS`));
        },
        credentials: true,
    }),
);
app.use(traceMiddleware);
app.use(responseTimeMiddleware);
app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));

app.get("/", (_request, response) => {
    response.status(200).json({ message: "Server is running" });
});
app.get("/health", (_request, response) => {
    response.status(200).json({ status: "ok" });
});

app.use("/auth", authRouter);
app.use("/org", orgRouter);
app.use("/catalogue", catalogueRouter);
app.use("/engineers", engRouter);
app.use("/clients", clientRouter);
app.use("/project", projectRouter);
app.use("/dashboard", dashboardRouter);
app.use("/pending", pendingRouter);
app.use("/user", userRouter);

async function start() {
    await Promise.all([connectMongoDB(), connectRedis()]);

    const server = app.listen(Number(env.PORT), "0.0.0.0", () => {
        logger.info(`Server running on port ${env.PORT}`);
    });

    const shutdown = async () => {
        server.close(async () => {
            await Promise.allSettled([disconnectMongoDB(), disconnectRedis()]);
            process.exit(0);
        });
    };

    process.once("SIGTERM", shutdown);
    process.once("SIGINT", shutdown);
}

start().catch((error) => {
    logger.error(`Server startup failed: ${error}`);
    process.exit(1);
});

export { app };
