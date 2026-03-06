import { ConflictError } from "../../shared/error/conflict.error.js";
import { MissingError } from "../../shared/error/missing.error.js";
import { prisma } from "../../shared/lib/prisma.js";
import { slugify } from "../../shared/utils/slugify.js";

export type CreateOrganizationInput = {
    name: string;
    userId: string;
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

    async getOrgs(userId: string) {
        return prisma.membership.findMany({
            where: {
                userId: userId,
            },
            select: {
                role: true,
                organizationId: true,
                organization: {
                    select: {
                        name: true,
                    },
                },
            },
        });
    },

    async identity(data: { orgName: string; userId: string }) {
        const fetchedData = await prisma.membership.findFirst({
            where: {
                userId: data.userId,
                organization: {
                    name: data.orgName,
                },
            },
            select: {
                role: true,
                organizationId: true,
                organization: {
                    select: { name: true },
                },
            },
        });

        if (!fetchedData) {
            throw new MissingError("Membership not found");
        }

        const response = {
            orgName: fetchedData.organization.name,
            orgId: fetchedData.organizationId,
            role: fetchedData.role,
        };

        return response;
    },
};

export default orgService;
