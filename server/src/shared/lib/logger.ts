import winston from "winston";

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

const colors = {
    error: "red",
    warn: "orange",
    info: "green",
    http: "magenta",
    debug: "white",
};

winston.addColors(colors);

export const logger = winston.createLogger({
    level: "debug",
    levels,
    format: winston.format.combine(
        winston.format.timestamp({ format: "HH:mm:ss" }),
        winston.format.colorize({ all: true }),
        winston.format.printf(
            (info) => `[${info.timestamp}] ${info.level}: ${info.message}`,
        ),
    ),
    transports: [new winston.transports.Console()],
});
