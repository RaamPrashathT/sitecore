import mongoose from "mongoose";
import { logger } from "./logger.js";

export const connectMongoDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGODB_URL!);
        logger.info(`MongoDB connected: ${connection.connection.host}`);
    } catch (error) {
        logger.error(`Error: ${error}`);
        process.exit(1);
    }
}