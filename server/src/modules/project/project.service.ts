import { prisma } from "../../shared/lib/prisma.js";
import { slugify } from "../../shared/utils/slugify.js";
import { RequistionItemListSchema, RequistionItemSchema, type CreatePhaseBody, type CreateRequisitionBody, type RequistionItemListBody } from "./project.schema.js";

const projectService = {
    async createProject({
        organizationId,
        projectName,
        address,
        estimatedBudget,
        engineerId,
        clientId,
    }: {
        readonly organizationId: string;
        readonly projectName: string;
        readonly address: string;
        readonly estimatedBudget: number;
        readonly engineerId: string;
        readonly clientId: string;
    }) {
        const slugBase = slugify(projectName);
        const lastProject = await prisma.project.findFirst({
            where: {
                slugBase: slugBase,
            },
            orderBy: {
                slugIndex: "desc",
            },
        });

        const nextIndex = lastProject ? lastProject.slugIndex + 1 : 1;
        const slug = nextIndex === 1 ? slugBase : `${slugBase}-${nextIndex}`;

        const result = await prisma.project.create({
            data: {
                name: projectName,
                slug,
                slugBase,
                slugIndex: nextIndex,
                organizationId: organizationId,
                address,
                estimatedBudget,
                assignments: {
                    create: [
                        {
                            userId: engineerId,
                            role: "ENGINEER",
                        },
                        {
                            userId: clientId,
                            role: "CLIENT",
                        },
                    ],
                },
            },
        });

        return {
            id: result.id,
            name: result.name,
            slug: result.slug,
        };
    },

    async getProjects(organizationId: string) {
        const result = await prisma.project.findMany({
            where: {
                organizationId: organizationId,
            },
            orderBy: {
                slug: "desc",
            },
        });

        return result.map((project) => ({
            id: project.id,
            name: project.name,
            slug: project.slug,
        }));
    },

    async getProjectDetails(projectSlug: string, organizationId: string) {
        const result = await prisma.project.findUnique({
            where: {
                slug_organizationId: {
                    slug: projectSlug,
                    organizationId: organizationId,
                },
            }
        })

        return {
            id: result?.id,
            name: result?.name,
            slug: result?.slug,
            address: result?.address,
            estimatedBudget: result?.estimatedBudget,
        }
    },

    async createPhase({
        projectId,
        data
    }: {
        readonly projectId: string;
        readonly data: CreatePhaseBody
    }) {
        await prisma.phase.create({
            data: {
                name: data.name,
                description: data.description,
                budget: data.budget,
                paymentDeadline: data.paymentDeadline,
                projectId: projectId,
                status: "PLANNING"
            }
        })
    },

    async getPhases(projectId: string) {
        const result = await prisma.phase.findMany({
            where: {
                projectId: projectId,
            },
            orderBy: {
                createdAt: "desc",
            }
        })

        return result
    },

    async paymentApproval(phaseId: string) {
        await prisma.phase.update({
            where: {
                id: phaseId,
                status: "PLANNING"
            },
            data: {
                status: "PAYMENT_PENDING"
            }
        })
    },

    async createRequisition({
        userId,
        phaseId 
    }: {
        readonly userId: string;
        readonly phaseId: string
    }) {
        const result = await prisma.requisition.create({
            data: {
                phaseId: phaseId,
                requestedBy: userId,
            }
        })

        return {
            id: result.id,
        }
    },

    async createRequistionItems({
        requisitionId,
        phaseId,
        items
    }: {
        readonly requisitionId: string;
        readonly phaseId: string;
        readonly items: RequistionItemListBody
    }) {
        const itemsToCreate = items.map((item) => ({
            quantity: item.quantity,
            estimatedUnitCost: item.estimatedCost,
            catalogueId: item.id,
            requisitionId: requisitionId
        }))
        await prisma.requisitionItem.createMany({
            data: itemsToCreate
        })

        await prisma.requisition.update({
            where: {
                id: requisitionId
            },
            data: {
                status: "PENDING_APPROVAL"
            }
        })
        await prisma.phase.update({
            where: {
                id: phaseId
            },
            data: {
                status: "APPROVAL_PENDING"
            }
        })

        return {
            count: items.length,
        }
    }

};

export default projectService;
