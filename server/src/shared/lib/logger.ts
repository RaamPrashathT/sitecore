import winston from "winston";
import path from "path";
import fs from "fs";

const logDir = path.join(process.cwd(), "logs");

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

const colors = {
    error: "red",
    warn: "yellow",
    info: "green",
    http: "magenta",
    debug: "white",
};

winston.addColors(colors);

const structuredFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf((info) => {
        const log = {
            timestamp: info.timestamp,
            level: info.level.toUpperCase(),

            service: info.service || "unknown-service",
            instance: info.instance || "local",
            environment:
                info.environment || process.env.NODE_ENV || "development",

            message: info.message,

            ...(info.traceId ? { traceId: info.traceId } : {}),
            ...(info.spanId ? { spanId: info.spanId } : {}),
            ...(info.userId ? { userId: info.userId } : {}),
            ...(info.endpoint ? { endpoint: info.endpoint } : {}),
            ...(info.method ? { method: info.method } : {}),

            ...(info.statusCode !== undefined
                ? { statusCode: info.statusCode }
                : {}),

            ...(info.responseTime !== undefined
                ? { responseTime: info.responseTime }
                : {}),

            ...(info.errorCode ? { errorCode: info.errorCode } : {}),
            ...(info.errorDetails ? { errorDetails: info.errorDetails } : {}),
            ...(info.tags ? { tags: info.tags } : {}),
        };

        return JSON.stringify(log);
    }),
);

const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: "HH:mm:ss" }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => `[${info.timestamp}] ${info.level}: ${info.message}`,
    ),
);

export const logger = winston.createLogger({
    level: "debug",
    levels,
    transports: [
        new winston.transports.Console({
            format: consoleFormat,
        }),
        new winston.transports.File({
            filename: path.join(logDir, "app.log"),
            format: structuredFormat,
            level: "info",
        }),
    ],
});
