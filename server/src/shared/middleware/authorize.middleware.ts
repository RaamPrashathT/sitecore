import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../lib/jose.js";

export const authorize = async(
    request: Request,
    response: Response,
    next: NextFunction,
) => {
    try {
        const accessToken = request.cookies.accessToken;
        if(!accessToken) {
            return response.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        
        const isVerified = await verifyAccessToken(accessToken);
        if (!isVerified) {
            return response.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        next();
    } catch (error) {
        return response.status(500).json({
            success: false,
            message: "Internal server error: " + error,
        });
    }
};
