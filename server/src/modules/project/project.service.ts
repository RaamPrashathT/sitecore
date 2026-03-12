import { prisma } from "../../shared/lib/prisma.js";
import { slugify } from "../../shared/utils/slugify.js";
import type { CreatePhaseBody } from "./project.schema.js";

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
    }
};

export default projectService;
