import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./modules/auth/auth.routes.js";
import { connectMongoDB } from "./shared/lib/mongo.js";
import { env } from "./shared/config/env.js";
const PORT = env.PORT || 5000;

const app = express();
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    }),
);

app.use(cookieParser());
app.use(express.json());
connectMongoDB();

app.use("/auth", authRouter);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

app.get("/", (_req, res) => {
    res.status(200).json({ message: "Server is running" });
});
