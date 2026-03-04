import { ConflictError } from "../../shared/error/conflict.error.js";
import { MissingError } from "../../shared/error/missing.error.js";
import { prisma } from "../../shared/lib/prisma.js";
import type { CreateOrganizationInput } from "./organization.schema.js";

const orgService = {
    async createOrg(data: CreateOrganizationInput) {
        const existingOrg = await prisma.organization.findUnique({
            where: {
                orgName: data.orgName,
            },
        });

        if (existingOrg) {
            throw new ConflictError("Organization already exists");
        }

        const newOrg = await prisma.organization.create({
            data: {
                orgName: data.orgName,
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
            orgName: newOrg.orgName,
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
                        orgName: true,
                    },
                },
            },
        });
    },

    async identity(data: { orgName: string; userId: string }) {
        console.log()
        const fetchedData = await prisma.membership.findFirst({
            where: {
                userId: data.userId,
                organization: {
                    orgName: data.orgName,
                },
            },
            select: {
                role: true,
                organizationId: true,
                organization: {
                    select: { orgName: true },
                },
            },
        });

        if (!fetchedData) {
            throw new MissingError("Membership not found");
        }

        const response = {
            orgName: fetchedData.organization.orgName,
            orgId: fetchedData.organizationId,
            role: fetchedData.role,
        };

        return response;
    },
};

export default orgService;
