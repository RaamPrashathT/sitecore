import { ConflictError } from "../../shared/error/conflict.error.js";
import { prisma } from "../../shared/lib/prisma.js";
import type { CreateOrganizationInput } from "./organization.schema.js";

const orgService = {
    async createOrg(data: CreateOrganizationInput): Promise<void> {
        
        const existingOrg = await prisma.organization.findUnique({
            where: {
                orgName: data.orgName,
            },
        });

        if (existingOrg) {
            throw new ConflictError("Organization already exists");
        }


        await prisma.organization.create({
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
                        orgName: true
                    }
                }
            } 
        })
    }


};

export default orgService;
