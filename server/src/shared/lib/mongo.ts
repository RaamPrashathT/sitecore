import mongoose from "mongoose";
import { logger } from "./logger.js";
import { env } from "../config/env.js";

export const connectMongoDB = async () => {
    try {
        const connection = await mongoose.connect(env.MONGODB_URL);
        logger.info(`MongoDB connected: ${connection.connection.host}`);
    } catch (error) {
        logger.error(`Error: ${error}`);
        process.exit(1);
    }
}