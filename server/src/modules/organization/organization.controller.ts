import type { Request, Response } from "express";
import orgService from "./organization.service.js";
import { logger } from "../../shared/lib/logger.js";
import {
    createOrganizationSchema,
    orgSlugSchema,
} from "./organization.schema.js";
import { ValidationError } from "../../shared/error/validation.error.js";
import { UnAuthorizedError } from "../../shared/error/unauthorized.error.js";
import { ConflictError } from "../../shared/error/conflict.error.js";
import { MissingError } from "../../shared/error/missing.error.js";
import { ZodError } from "zod";
import { addOrgContext } from "../../shared/utils/session.js";
import redis from "../../shared/lib/redis.js";
import { notify } from "../../shared/lib/notify.js";
import { NotificationEntityType, NotificationType } from "../../../generated/prisma/index.js";

const orgController = {
    async create(request: Request, response: Response) {
        try {
            const sessionId = request.cookies.session;
            if (!request.session) {
                throw new UnAuthorizedError();
            }
            const tenants = request.session.tenant;

            const validatedData = createOrganizationSchema.safeParse(
                request.body,
            );

            if (!validatedData.success) {
                throw new ValidationError(validatedData.error.message);
            }

            const result = await orgService.create({
                name: validatedData.data.name,
                userId: request.session.userId,
            });

            const newTenants = {
                ...tenants,
                [result.slug]: {
                    id: result.orgId,
                    role: "ADMIN",
                },
            };

            const raw = await redis.get(`session:${sessionId}`);
            if (!raw) throw new UnAuthorizedError();

            let session;

            try {
                session = JSON.parse(raw);
            } catch {
                logger.error("Invalid session JSON");
                throw new UnAuthorizedError();
            }
            await redis.set(
                `session:${sessionId}`,
                JSON.stringify({
                    ...session,
                    tenant: newTenants,
                }),
            );
            return response.status(201).json(result);
        } catch (error) {
            if (error instanceof UnAuthorizedError) {
                return response.status(401).json({
                    success: false,
                    message: error.message,
                });
            }
            if (error instanceof ConflictError) {
                return response.status(409).json({
                    success: false,
                    message: error.message,
                });
            }
            if (error instanceof ValidationError) {
                return response.status(400).json({
                    success: false,
                    message: error.message,
                });
            }
            logger.error(error);
            return response.status(500).json({
                success: false,
                message: "Something went wrong",
            });
        }
    },

    async signin(request: Request, response: Response) {
        try {
            if (!request.session?.userId) {
                throw new UnAuthorizedError();
            }

            const userId = request.session.userId;
            const orgId = request.body.id;

            const result = await orgService.signup(userId, orgId);
            await notify({
                type: NotificationType.ORGANIZATION_INVITATION_REQUEST,
                title: "New Join Request",
                body: `${result.username} - ${result.email} has requested to join ${result.organization.name}`,
                entityType: NotificationEntityType.INVITATION,
                entityId: result.id,
                orgId: result.organizationId,
            });
            return response.status(200).json({ result });
        } catch (error) {
            if (error instanceof UnAuthorizedError) {
                return response.status(401).json({
                    success: false,
                    message: error.message,
                });
            }
            logger.error(error);
            return response.status(500).json({
                success: false,
                message: "Something went wrong",
            });
        }
    },

    async getOrg(request: Request, response: Response) {
        try {
            const sessionId = request.session?.userId;

            const result = await orgService.getOrgs(sessionId as string);

            return response.status(200).json(result);
        } catch (error) {
            logger.error(error);
            return response.status(500).json({
                success: false,
                message: "Something went wrong",
            });
        }
    },

    async getAllOrg(request: Request, response: Response) {
        try {
            const query = (request.query.query as string) || "";
            const page = Number(request.query.page) || 1;
            const limit = Number(request.query.limit) || 10;
            const result = await orgService.getAllOrgs({
                query,
                page,
                limit,
            });

            return response.status(200).json(result);
        } catch (error) {
            logger.error(error);
            return response.status(500).json({
                success: false,
                message: "Something went wrong",
            });
        }
    },

    async identity(request: Request, response: Response) {
        try {
            const slug = orgSlugSchema.parse(request.body.slug);

            const input = {
                slug: slug,
                userId: request.session!.userId,
            };

            const result = await orgService.identity(input);

            await addOrgContext(request.cookies.session, {
                orgId: result.id,
                slug: result.slug,
                role: result.role,
            });

            return response.status(200).json(result);
        } catch (error) {
            if (error instanceof ZodError) {
                return response.status(400).json({
                    success: false,
                    message: error.issues[0]?.message,
                });
            }
            if (error instanceof MissingError) {
                return response.status(404).json({
                    success: false,
                    message: error.message,
                });
            }
            logger.error(error);
            return response.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    },
};

export default orgController;
