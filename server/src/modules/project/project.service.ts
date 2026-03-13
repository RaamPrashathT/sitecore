import { prisma } from "../../shared/lib/prisma.js";
import { User } from "../../shared/models/user.js";
import { slugify } from "../../shared/utils/slugify.js";
import { type CreatePhaseBody, type RequistionItemListBody } from "./project.schema.js";

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
                status: "PAYMENT_PENDING"
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
                status: "PAYMENT_PENDING"
            },
            data: {
                status: "ACTIVE"
            }
        })
    },

    async createRequisition({
        userId,
        phaseId,
        budget
    }: {
        readonly userId: string;
        readonly phaseId: string
        readonly budget: number
    }) {
        const result = await prisma.requisition.create({
            data: {
                phaseId: phaseId,
                requestedBy: userId,
                budget: budget,
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
                status: "PAYMENT_PENDING"
            }
        })

        return {
            count: items.length,
        }
    },

    async getPaymentPendingPhases(organizationId: string) {
        const result = await prisma.phase.findMany({
            where: {
                status: "PAYMENT_PENDING",
                isPaid: false,
                project: {
                    organizationId: organizationId
                }
            },
            select: {
                id: true,
                name: true,
                budget: true,
                paymentDeadline: true,

                project: {
                    select: {
                        name: true,

                        assignments: {
                            where: {
                                role: "CLIENT"
                            },
                            select: {
                                userId: true,
                            }
                        }

                    }
                }
            },
            orderBy: {
                paymentDeadline: "asc"
            }
        })
        const userIds = [...new Set(
            result.flatMap(phase => 
                phase.project.assignments.map(assignment => assignment.userId)
            )
        )];
        const clients = await User.find({
            _id: {
                $in: userIds
            }
        })

        const clientMap = new Map(clients.map(client => [client._id.toString(), client.username]))
        
        return result.map(phase => {
            const firstClientId = phase.project.assignments[0]?.userId?.toString();
            return {
                id: phase.id,
                phaseName: phase.name,
                projectName: phase.name,
                budget: phase.budget,
                paymentDeadline: phase.paymentDeadline,
                client: (firstClientId ? clientMap.get(firstClientId) : null) || "Unknown Client"
            }
        })
    }

};

export default projectService;
