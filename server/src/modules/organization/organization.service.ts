import { MissingError } from "../../shared/error/missing.error.js";
import { prisma } from "../../shared/lib/prisma.js";
import { User } from "../../shared/models/user.js";
import { slugify } from "../../shared/utils/slugify.js";

export type CreateOrganizationInput = {
    name: string;
    userId: string;
};

type OrgIdentity = {
    id: string;
    name: string;
    slug: string;
    role: "ADMIN" | "ENGINEER" | "CLIENT" | "IDLE";
};

const orgService = {
    async create(data: CreateOrganizationInput) {
        const slugBase = slugify(data.name);

        const lastOrg = await prisma.organization.findFirst({
            where: { slugBase },
            orderBy: { slugIndex: "desc" },
        });

        const nextIndex = lastOrg ? lastOrg.slugIndex + 1 : 1;
        const slug = nextIndex === 1 ? slugBase : `${slugBase}-${nextIndex}`;

        const newOrg = await prisma.organization.create({
            data: {
                name: data.name,
                slugBase,
                slugIndex: nextIndex,
                slug,
                members: {
                    create: {
                        userId: data.userId,
                        role: "ADMIN",
                    },
                },
            },
        });

        return {
            orgId: newOrg.id,
            orgName: newOrg.name,
            slug: newOrg.slug,
        };
    },

    async signup(userId: string, orgId: string) {
        const result = await prisma.membership.create({
            data: {
                userId: userId,
                role: "IDLE",
                organizationId: orgId,
            },
            include: {
                organization: true,
            },
        });

        const user = await User.findById(result.userId);

        return {
            ...result,
            email: user?.email,
            username: user?.username,
        };
    },

    async getOrgs(userId: string) {
        const memberships = await prisma.membership.findMany({
            where: {
                userId: userId,
            },
            select: {
                role: true,
                organization: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
            },
        });
        return memberships.map((membership) => {
            return {
                id: membership.organization.id,
                name: membership.organization.name,
                slug: membership.organization.slug,
                role: membership.role,
            };
        });
    },

    async getAllOrgs({
        query,
        page,
        limit,
    }: {
        query: string;
        page: number;
        limit: number;
    }) {
        const skip = (page - 1) * limit;
        const [items, totalCount] = await Promise.all([
            prisma.organization.findMany({
                where: {
                    name: {
                        contains: query,
                        mode: "insensitive",
                    },
                },
                skip: skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            }),
            prisma.organization.count({
                where: {
                    name: {
                        contains: query,
                        mode: "insensitive",
                    },
                },
            }),
        ]);

        return {
            items,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            hasNextPage: page + limit < totalCount,
        };
    },

    async identity(data: {
        slug: string;
        userId: string;
    }): Promise<OrgIdentity> {
        const fetchedData = await prisma.membership.findFirst({
            where: {
                userId: data.userId,
                organization: {
                    slug: data.slug,
                },
            },
            select: {
                role: true,
                organizationId: true,
                organization: {
                    select: {
                        name: true,
                        slug: true,
                    },
                },
            },
        });

        if (!fetchedData) {
            throw new MissingError("Membership not found");
        }

        return {
            id: fetchedData.organizationId,
            name: fetchedData.organization.name,
            slug: fetchedData.organization.slug,
            role: fetchedData.role,
        };
    },

    async getNotifications(
        userId: string,
        organizationId: string,
        role: string,
    ) {
        const notifications = await prisma.notificationRecipient.findMany({
            where: {
                membership: {
                    userId,
                    organizationId,
                },
            },
            include: {
                notification: true,
            },
            orderBy: {
                notification: { createdAt: "desc" },
            },
        });

        return notifications
    },

    async getSettings(organizationId: string) {
        const org = await prisma.organization.findUnique({
            where: { id: organizationId },
            select: {
                id: true,
                name: true,
                slug: true,
                image: true,
                createdAt: true,
            },
        });
    
        if (!org) throw new MissingError("Organization not found");
        return org;
    },
    
    async updateSettings(
        organizationId: string,
        data: { name?: string; image?: string },
    ) {
        const updateData: { name?: string; image?: string } = {};
    
        if (data.name !== undefined) updateData.name = data.name;
        if (data.image !== undefined) updateData.image = data.image;
    
        const updated = await prisma.organization.update({
            where: { id: organizationId },
            data: updateData,
            select: {
                id: true,
                name: true,
                slug: true,
                image: true,
            },
        });
    
        return updated;
    },
};

export default orgService;
