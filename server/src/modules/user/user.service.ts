import { Types } from "mongoose";
import { MissingError } from "../../shared/error/missing.error";
import { prisma } from "../../shared/lib/prisma";
import { User } from "../../shared/models/user";
import { UnAuthorizedError } from "../../shared/error/unauthorized.error";

export const userService = {
    async getInvitationDetails(token: string) {
        const invitation = await prisma.invitation.findFirst({
            where: {
                token,
                status: "PENDING",
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
                                            where: { role: "ADMIN" },
                                            select: { userId: true },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!invitation)
            throw new MissingError(
                "Invitation not found, expired, or already claimed.",
            );

        const projects = invitation.projects.map((project) => ({
            name: project.project.name,
            id: project.project.id,
        }));

        const organization = invitation.projects[0]?.project.organization;

        if (!organization)
            throw new MissingError("Organization not found for this invite.");

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
        // 1. Fetch invitation with nested project slugs
        const invitation = await prisma.invitation.findFirst({
            where: {
                token,
                status: "PENDING",
                expiresAt: { gt: new Date() },
            },
            include: {
                projects: {
                    include: {
                        project: { select: { slug: true } },
                    },
                },
            },
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

        // 2. Fetch Organization slug separately
        const organization = await prisma.organization.findUnique({
            where: { id: invitation.organizationId },
            select: { slug: true },
        });

        await prisma.$transaction(async (tx) => {
            await tx.invitation.update({
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

        // 3. Setup slugs and notify!
        const orgSlug = organization?.slug || "";
        const projectSlug = invitation.projects[0]?.project.slug || "";

        await notify({
            type: "PROJECT_INVITATION_ACCEPTED",
            title: "Team Invitation Accepted",
            body: `${userEmail} has accepted the invitation and joined the project team.`,
            entityType: "INVITATION",
            entityId: invitation.id,
            orgId: invitation.organizationId,
            projectId: invitation.projects[0]?.projectId,
            actionUrl: `/${orgSlug}/${projectSlug}/members`,
        });

        return {
            success: true,
            message: "Invitation accepted successfully.",
            id: invitation.id,
            projectId: invitation.projects[0]?.projectId,
            organizationId: invitation.organizationId,
        };
    },

    async declineInvitation(token: string, userId: string, userEmail: string) {
        // 1. Fetch invitation with nested project slugs
        const invitation = await prisma.invitation.findFirst({
            where: {
                token,
                status: "PENDING",
            },
            include: {
                projects: {
                    include: {
                        project: { select: { slug: true } },
                    },
                },
            },
        });

        if (!invitation) {
            throw new UnAuthorizedError(
                "Invalid or already processed invitation.",
            );
        }

        if (invitation.email !== userEmail) {
            throw new UnAuthorizedError(
                "You do not have permission to decline this invite.",
            );
        }

        // 2. Fetch Organization slug separately
        const organization = await prisma.organization.findUnique({
            where: { id: invitation.organizationId },
            select: { slug: true },
        });

        await prisma.invitation.update({
            where: { id: invitation.id },
            data: {
                status: "REJECTED",
            },
        });

        // 3. Setup slugs and notify!
        const orgSlug = organization?.slug || "";
        const projectSlug = invitation.projects[0]?.project.slug || "";

        await notify({
            type: "PROJECT_INVITATION_REJECTED",
            title: "Invitation Declined",
            body: `${userEmail} has declined the invitation to join the project.`,
            entityType: "INVITATION",
            entityId: invitation.id,
            orgId: invitation.organizationId,
            projectId: invitation.projects[0]?.projectId,
            actionUrl: `/${orgSlug}/${projectSlug}/members`,
        });

        return {
            success: true,
            message: "Invitation declined successfully.",
            id: invitation.id,
            projectId: invitation.projects[0]?.projectId,
            organizationId: invitation.organizationId,
        };
    },
};
