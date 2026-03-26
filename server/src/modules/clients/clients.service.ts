import { prisma } from "../../shared/lib/prisma.js";
import { User } from "../../shared/models/user.js";
import type { CreateInviteBodySchema } from "./clients.schema.js";
import crypto from "node:crypto";
import { Role } from "../../../generated/prisma/client.js";
import { MissingError } from "../../shared/error/missing.error.js";
import { Types } from "mongoose";
import { sendInviteEmail } from "../../shared/lib/emails/sendClientInvitation.js";
import { UnAuthorizedError } from "../../shared/error/unauthorized.error.js";

const clientService = {
    async getClients(
        organizationId: string,
        pageIndex: number,
        pageSize: number,
        searchQuery: string,
    ) {
        const skip = pageIndex * pageSize;

        const pendingMemberships = await prisma.membership.findMany({
            where: {
                organizationId: organizationId,
                role: "CLIENT",
            },
            select: {
                userId: true,
                role: true,
            },
        });

        const userIds = pendingMemberships.map((m) => m.userId);

        if (userIds.length === 0) {
            return { data: [], totalCount: 0, totalPages: 0 };
        }

        const mongoQuery: any = {
            _id: { $in: userIds },
        };

        if (searchQuery) {
            mongoQuery.username = { $regex: searchQuery, $options: "i" };
        }

        const [users, totalCount] = await Promise.all([
            User.find(mongoQuery)
                .skip(skip)
                .limit(pageSize)
                .select("username email profileImage")
                .lean(),
            User.countDocuments(mongoQuery),
        ]);

        const data = users.map((user) => {
            const membership = pendingMemberships.find(
                (m) => m.userId === user._id.toString(),
            );

            return {
                id: user._id.toString(),
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
                role: membership?.role || "CLIENT",
            };
        });

        return {
            data,
            totalCount,
            totalPages: Math.ceil(totalCount / pageSize),
        };
    },

    async createInvite(organizationId: string, data: CreateInviteBodySchema) {
        const { email, projects } = data;
        const token = crypto.randomBytes(32).toString("hex");
        await prisma.clientInvitation.create({
            data: {
                email,
                token,
                role: Role.CLIENT,
                organizationId,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000),
                projects: {
                    create: projects.map((projectId) => ({
                        projectId,
                    })),
                },
            },
        });
        await sendInviteEmail(email, token);
    },

    async getInvitationDetails(token: string) {
        const invitation = await prisma.clientInvitation.findFirst({
            where: {
                token,
                expiresAt: {
                    gt: new Date(),
                },
            },
            select: {
                email: true,
                projects: {
                    select: {
                        project: {
                            select: {
                                id: true,
                                name: true,
                                organization: {
                                    select: {
                                        id: true,
                                        name: true,
                                        members: {
                                            where: {
                                                role: "ADMIN",
                                            },
                                            select: {
                                                userId: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!invitation) throw new MissingError("Invitation not found");

        const projects = invitation.projects.map((project) => ({
            name: project.project.name,
            id: project.project.id,
        }));

        const organization = invitation.projects[0]?.project.organization;

        if (!organization) throw new MissingError("Organization not found");

        const adminIds = [
            ...new Set(organization.members.map((member) => member.userId)),
        ];

        const objectIds = adminIds.map((id) => new Types.ObjectId(id));

        const admins = await User.find(
            { _id: { $in: objectIds } },
            { username: 1, profileImage: 1 },
        ).lean();

        const adminMap = new Map(
            admins.map((admin) => [admin._id.toString(), admin]),
        );

        const adminDetails = adminIds.map((id) => {
            const admin = adminMap.get(id);
            return {
                userId: id,
                username: admin?.username || null,
                profileImage: admin?.profileImage || null,
            };
        });

        return {
            organization: {
                id: organization.id,
                name: organization.name,
            },
            projects,
            admins: adminDetails,
            email: invitation.email,
        };
    },

    async acceptInvitation(token: string, userId: string, userEmail: string) {
        const invitation = await prisma.clientInvitation.findFirst({
            where: {
                token,
                status: "PENDING",
                expiresAt: { gt: new Date() },
            },
            include: { projects: true },
        });

        if (!invitation) {
            throw new UnAuthorizedError(
                "Invalid, expired, or already claimed invitation",
            );
        }

        if (invitation.email !== userEmail) {
            throw new UnAuthorizedError(
                `Account Mismatch: Please log in with ${invitation.email}`,
            );
        }

        await prisma.$transaction(async (tx) => {
            await tx.clientInvitation.update({
                where: { id: invitation.id },
                data: {
                    status: "ACCEPTED",
                    accepted: true,
                    claimedByUserId: userId,
                },
            });

            await tx.membership.upsert({
                where: {
                    userId_organizationId: {
                        userId,
                        organizationId: invitation.organizationId,
                    },
                },
                create: {
                    userId,
                    organizationId: invitation.organizationId,
                    role: invitation.role,
                },
                update: {},
            });
            for (const proj of invitation.projects) {
                await tx.assignment.upsert({
                    where: {
                        userId_projectId: { userId, projectId: proj.projectId },
                    },
                    create: {
                        userId,
                        projectId: proj.projectId,
                        role: invitation.role,
                    },
                    update: {},
                });
            }
        });
        return { success: true, message: "Welcome to the organization." };
    },
};

export default clientService;
