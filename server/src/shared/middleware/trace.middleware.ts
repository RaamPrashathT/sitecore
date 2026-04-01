import type { Request, Response, NextFunction } from "express";
import { v4 as uuid } from "uuid";

export const traceMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const traceId = req.headers["x-trace-id"] as string || uuid();

    req.traceId = traceId;

    res.setHeader("x-trace-id", traceId);

    next();
};