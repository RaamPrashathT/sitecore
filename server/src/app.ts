import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectMongoDB } from "./shared/lib/mongo.js";
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
const PORT = env.PORT || 5000;

const app = express();
app.use(
    cors({
        origin:env.CLIENT_ORIGIN,
        credentials: true,
    }),
);

app.use(cookieParser());
app.use(express.json());
connectMongoDB();

app.use("/auth", authRouter);
app.use("/org", orgRouter);
app.use("/catalogue", catalogueRouter)
app.use('/engineers', engRouter)
app.use('/clients', clientRouter)
app.use('/project', projectRouter)
app.use('/dashboard', dashboardRouter)
app.use('/pending', pendingRouter)
app.use('/user', userRouter)

app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});

app.get("/", (_req, res) => {
    res.status(200).json({ message: "Server is running" });
});
