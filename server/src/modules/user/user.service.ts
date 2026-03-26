import { Types } from "mongoose";
import { MissingError } from "../../shared/error/missing.error";
import { prisma } from "../../shared/lib/prisma";
import { User } from "../../shared/models/user";

export const userService = {
    async getInvitationDetails(token: string) {
        const invitation = await prisma.clientInvitation.findFirst({
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
};
