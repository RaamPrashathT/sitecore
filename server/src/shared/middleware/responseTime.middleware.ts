import { logger } from "../lib/logger.js";
import type { Request, Response, NextFunction } from "express";

export const responseTimeMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    Object.defineProperty(res.locals, 'responseTime', {
        get: () => Date.now() - start,
        enumerable: true
    });

    res.on("finish", () => {
        const responseTime = Date.now() - start;
        const userId = res.locals.userId || "anonymous";
        logger.info("Request completed", {
            method: req.method,
            userId: userId,
            endpoint: req.originalUrl,
            statusCode: res.statusCode,
            responseTime,
            traceId: (req as any).traceId, 
        });
    });

    next();
};