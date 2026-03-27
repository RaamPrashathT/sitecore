import type { Request, Response } from "express";
import { User } from "../../shared/models/user.js";
import redis from "../../shared/lib/redis.js";
import { logger } from "../../shared/lib/logger.js";
import { MissingError } from "../../shared/error/missing.error.js";
import { UnAuthorizedError } from "../../shared/error/unauthorized.error.js";
import { userService } from "./user.service.js";
import { syncSessionTenants } from "../../shared/lib/syncSession.js";

const userController = {
    async onboard(request: Request, response: Response) {
        try {
            const session = request.session;
            if (!session)
                return response.status(401).json({ message: "Unauthorized" });

            const { username, phone, avatar, isTwoFactorEnabled } =
                request.body;

            await User.updateOne(
                { _id: session.userId },
                {
                    $set: {
                        username,
                        phone,
                        profileImage: avatar,
                        isTwoFactorEnabled: isTwoFactorEnabled || false,
                        onboarded: true,
                    },
                },
            );

            session.username = username;
            session.onboarded = true;

            await redis.set(
                `session:${request.cookies.session}`,
                JSON.stringify(session),
                { EX: 60 * 60 * 24 },
            );

            return response.status(200).json({
                message: "Onboarding complete",
            });
        } catch (error) {
            logger.error("Onboarding Error:", error);
            return response
                .status(500)
                .json({ message: "Internal server error" });
        }
    },

    async getInvitationDetails(request: Request, response: Response) {
        try {
            const token = request.query.token as string;
            if (!token) throw new UnAuthorizedError("Token is required");

            const invitation = await userService.getInvitationDetails(token);

            const sessionEmail = request.session?.email;
            let sessionState;
            const existingUser = await User.findOne(
                { email: invitation.email },
                { _id: 1 },
            ).lean();

            if (!sessionEmail) {
                sessionState = "UNAUTHENTICATED";
            } else if (sessionEmail !== invitation.email) {
                sessionState = "MISMATCH";
            } else {
                sessionState = "AUTHENTICATED";
            }

            const result = {
                organization: invitation.organization,
                projects: invitation.projects,
                admins: invitation.admins,
                currentUser: sessionEmail ?? null,
                userExists: !!existingUser,
                sessionState,
                invitedEmail: invitation.email,
            };

            return response.status(200).json(result);
        } catch (error) {
            if (error instanceof MissingError) {
                return response.status(404).json({ message: error.message });
            }
            if (error instanceof UnAuthorizedError) {
                return response.status(401).json({ message: error.message });
            }
            logger.error(error);
            return response.status(500).json({
                message: "Internal server error",
            });
        }
    },

    async provision(request: Request, response: Response) {
        try {
            const session = request.session;
            const stashedToken = await redis.get(
                `pending_invite:${session!.userId}`,
            );

            if (stashedToken) {
                await redis.del(`pending_invite:${session!.userId}`);
            }
            const redirectTo = stashedToken
                ? `/invitation?token=${stashedToken}`
                : "/organizations";

            return response.status(200).json({
                onboarded: session!.onboarded,
                redirectTo,
            });
        } catch (error) {
            logger.error("Provisioning Error:", error);
            return response
                .status(500)
                .json({ message: "Internal server error" });
        }
    },

    async acceptInvite(request: Request, response: Response) {
        try {
            const { token } = request.body;
            const sessionId = request.cookies.session;
            const { userId, email } = request.session!;

            if (!token)
                return response
                    .status(400)
                    .json({ message: "Token is required" });

            const result = await userService.acceptInvitation(
                token,
                userId,
                email,
            );
            await syncSessionTenants(userId, sessionId);
            return response.status(200).json(result);
        } catch (error) {
            if (error instanceof UnAuthorizedError) {
                return response.status(403).json({ message: error.message });
            }
            logger.error("Accept Invite Error:", error);
            return response
                .status(500)
                .json({ message: "Internal server error" });
        }
    },

    async declineInvite(request: Request, response: Response) {
        try {
            const { token } = request.body;
            const { userId, email } = request.session!;

            if (!token)
                return response
                    .status(400)
                    .json({ message: "Token is required" });

            const result = await userService.declineInvitation(
                token,
                userId,
                email,
            );

            return response.status(200).json(result);
        } catch (error) {
            if (error instanceof UnAuthorizedError) {
                return response.status(403).json({ message: error.message });
            }
            logger.error("Decline Invite Error:", error);
            return response
                .status(500)
                .json({ message: "Internal server error" });
        }
    },
};

export default userController;
