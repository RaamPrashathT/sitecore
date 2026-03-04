import type { Request, Response, NextFunction } from "express";
import redis from "../lib/redis.js";
import { logger } from "../lib/logger.js";
import { UnAuthorizedError } from "../error/unauthorized.error";

export const orgAuthorize = async (
    request: Request,
    response: Response,
    next: NextFunction,
) => {
    try {
        const incomingOrgId = request.headers["x-org-id"] as string
        const sessionId = request.cookies.session;
        
        const sessionStr = await redis.get(`session:${sessionId}`);
        const sessionObj = JSON.parse(sessionStr as string);

        const context = sessionObj.contexts?.[incomingOrgId]

        if(!context) {
            throw new UnAuthorizedError("Unauthorized")
        }

        request.tenant = {
            orgId: context,
            role: sessionObj.role
        }
        console.log(request.tenant)
        next();
    } catch (error) {
        if(error instanceof UnAuthorizedError) {
            return response.status(401).json({
                success: false,
                message: error.message
            })
        }
        logger.error(error);
        return response.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}