import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { connectMongoDB } from "./shared/lib/mongo.js";
dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());
connectMongoDB();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

app.get("/", (_req, res) => {
    res.status(200).json({ message: "Server is running" });
});
