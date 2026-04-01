import type { Request, Response, NextFunction } from "express";

export const responseTimeMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const start = Date.now();

    res.on("finish", () => {
        const responseTime = Date.now() - start;
        res.locals.responseTime = responseTime;
    });

    next();
};