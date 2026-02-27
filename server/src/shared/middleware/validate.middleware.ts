import type { ZodType } from "zod";
import type { Request, Response, NextFunction } from "express";

export const validate =
    (schema: ZodType) =>
    (request: Request, response: Response, next: NextFunction): void => {
        const validatedData = schema.safeParse(request.body);
        if(!validatedData.success) {
            response.status(401).json({
                success: false,
                message: "Invalid Email or password"
            })
            return
        }
        request.body = validatedData.data;
        next();
    };
