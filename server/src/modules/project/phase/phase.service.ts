import { ValidationError } from "../../../shared/error/validation.error.js";
import { prisma } from "../../../shared/lib/prisma.js";

const phaseService = {
    async createPhase(
        projectId: string,
        data: {
            name: string;
            description?: string | undefined;
            startDate: Date;
            paymentDeadline: Date;
            prevOrder?: number | undefined;
            nextOrder?: number | undefined;
            lineItems: Array<{
                name: string;
                category: any;
                estimatedCost: number;
                billedValue: number;
            }>;
        },
    ) {
        const slugBase = data.name
            .toLowerCase()
            .trim()
            .replace(/[\s\W-]+/g, "-")
            .replace(/^-+|-+$/g, "");

        const lastPhase = await prisma.phase.findFirst({
            where: {
                projectId: projectId,
                slugBase: slugBase,
            },
            orderBy: { slugIndex: "desc" },
        });

        const nextIndex = lastPhase ? lastPhase.slugIndex + 1 : 1;
        const currentSlug =
            nextIndex === 1 ? slugBase : `${slugBase}-${nextIndex}`;

        let calculatedOrder = 1;

        if (data.prevOrder !== undefined && data.nextOrder !== undefined) {
            calculatedOrder = (data.prevOrder + data.nextOrder) / 2;
        } else if (data.prevOrder !== undefined) {
            calculatedOrder = data.prevOrder + 1;
        } else if (data.nextOrder !== undefined) {
            calculatedOrder = data.nextOrder / 2;
        } else {
            const lastPhase = await prisma.phase.findFirst({
                where: { projectId },
                orderBy: { sequenceOrder: "desc" },
                select: { sequenceOrder: true },
            });

            if (lastPhase) {
                calculatedOrder = Number(lastPhase.sequenceOrder) + 1;
            } else {
                calculatedOrder = 1;
            }
        }

        const phase = await prisma.phase.create({
            data: {
                projectId: projectId,
                name: data.name,
                description: data.description || null,
                startDate: data.startDate,
                paymentDeadline: data.paymentDeadline,
                sequenceOrder: calculatedOrder,
                status: "PLANNING", 
                slug: currentSlug,
                slugBase: slugBase,
                slugIndex: nextIndex,
                lineItems: {
                    create: data.lineItems.map(item => ({
                        name: item.name,
                        category: item.category,
                        estimatedCost: item.estimatedCost,
                        billedValue: item.billedValue,
                    }))
                }
            },
            include: { lineItems: true }
        });

        return {
            id: phase.id,
            name: phase.name,
            slug: phase.slug,
            sequenceOrder: phase.sequenceOrder,
            status: phase.status,
            totalBilledValue: phase.lineItems.reduce((acc, curr) => acc + Number(curr.billedValue), 0)
        };
    },

    async getProjectTimeline(projectId: string) {
        // NOTE: Because site logs are now project-centric, this timeline query will need to be 
        // adjusted in Step 3 when we rewrite the sitelog architecture.
        // For now, returning basic phase data to prevent crashes.
        const phases = await prisma.phase.findMany({
            where: { projectId: projectId },
            orderBy: { sequenceOrder: "desc" },
            include: { lineItems: true }
        });

        return phases.map((phase) => ({
            id: phase.id,
            name: phase.name,
            description: phase.description,
            budget: phase.lineItems.reduce((sum, item) => sum + Number(item.billedValue), 0),
            status: phase.status,
            startDate: phase.startDate,
        }));
    },

    async getPhases(projectId: string) {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                phases: {
                    orderBy: { sequenceOrder: "desc" },
                    include: {
                        lineItems: true,
                        requisitions: {
                            where: { status: "APPROVED" },
                            select: { budget: true },
                        },
                    },
                },
            },
        });
        if (!project) {
            throw new ValidationError("Project not found");
        }

        const totalBudget = Number(project.estimatedBudget);
        let totalSpent = 0;
        let activePhasesCount = 0;

        const mappedPhases = project.phases.map((phase) => {
            const phaseSpent = phase.requisitions.reduce(
                (sum, req) => sum + Number(req.budget),
                0,
            );
            totalSpent += phaseSpent;

            if (phase.status === "ACTIVE") activePhasesCount++;
            
            // Replaces the old static budget field
            const calculatedBudget = phase.lineItems.reduce((sum, item) => sum + Number(item.billedValue), 0);

            return {
                id: phase.id,
                name: phase.name,
                slug: phase.slug,
                status: phase.status,
                startDate: phase.startDate,
                description: phase.description,
                sequenceOrder: Number(phase.sequenceOrder),
                budget: calculatedBudget,
                spent: phaseSpent,
            };
        });

        const overallProgress =
            totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

        return {
            project: {
                id: project.id,
                name: project.name,
                totalBudget: totalBudget,
                totalSpent: totalSpent,
                activePhasesCount: activePhasesCount,
                overallProgress: overallProgress,
            },
            phases: mappedPhases,
        };
    },

    async getPhaseDetails(projectId: string, phaseId: string) {
        const phase = await prisma.phase.findUnique({
            where: { id: phaseId, projectId: projectId },
            include: {
                lineItems: true,
                requisitions: {
                    where: { status: "APPROVED" },
                    select: { budget: true },
                },
            },
        });

        if (!phase) {
            throw new ValidationError("Phase not found");
        }

        const spent = phase.requisitions.reduce(
            (sum, req) => sum + Number(req.budget),
            0,
        );
        const calculatedBudget = phase.lineItems.reduce((sum, item) => sum + Number(item.billedValue), 0);

        return {
            phaseSnapshot: {
                id: phase.id,
                name: phase.name,
                status: phase.status,
                budget: calculatedBudget,
                spent: spent,
                paymentDeadline: phase.paymentDeadline,
            },
            lineItems: phase.lineItems
        };
    },

    async getPhaseInfo(projectId: string, phaseSlug: string) {
        const phase = await prisma.phase.findUnique({
            where: {
                slug_projectId: {
                    slug: phaseSlug,
                    projectId: projectId,
                },
            },
            include: {
                lineItems: true,
                requisitions: {
                    include: {
                        items: {
                            where: { status: "ORDERED" },
                            select: { quantity: true, estimatedUnitCost: true },
                        },
                    },
                },
            },
        });

        if (!phase) {
            throw new ValidationError("Phase not found");
        }

        let spent = 0;
        phase.requisitions.forEach((req) => {
            req.items.forEach((item) => {
                spent += Number(item.quantity) * Number(item.estimatedUnitCost);
            });
        });

        const calculatedBudget = phase.lineItems.reduce((sum, item) => sum + Number(item.billedValue), 0);
        const remaining = calculatedBudget - spent;

        return {
            id: phase.id,
            slug: phase.slug,
            name: phase.name,
            sequenceOrder: Number(phase.sequenceOrder),
            status: phase.status,
            startDate: phase.startDate,
            financials: {
                budget: calculatedBudget,
                spent,
                remaining,
            },
            lineItems: phase.lineItems
        };
    },

    async updatePhase(
        projectId: string,
        phaseSlug: string,
        data: {
            name?: string | undefined;
            description?: string | undefined;
            startDate?: Date | undefined;
            paymentDeadline?: Date | undefined;
        },
    ) {
        const phase = await prisma.phase.findUnique({
            where: {
                slug_projectId: {
                    slug: phaseSlug,
                    projectId: projectId,
                },
            },
        });

        if (!phase) {
            throw new ValidationError("Phase not found");
        }

        const isLocked = phase.status === "ACTIVE" || phase.status === "COMPLETED";

        if (isLocked) {
            if (
                data.startDate !== undefined &&
                data.startDate.getTime() !== phase.startDate.getTime()
            ) {
                throw new ValidationError(
                    "Cannot modify the start date of a phase that is already active or completed.",
                );
            }
            delete data.startDate;
        }

        const updatePayload = Object.fromEntries(
            Object.entries(data).filter(([_, value]) => value !== undefined),
        );

        const updatedPhase = await prisma.phase.update({
            where: { id: phase.id },
            data: updatePayload,
        });

        return {
            id: updatedPhase.id,
            slug: updatedPhase.slug,
            name: updatedPhase.name,
            status: updatedPhase.status,
        };
    },

    async deletePhase(projectId: string, phaseId: string) {
        const phase = await prisma.phase.findUnique({
            where: {
                id: phaseId,
                projectId: projectId,
            },
        });

        if (!phase) {
            throw new ValidationError("Phase not found");
        }

        if (phase.status === "ACTIVE" || phase.status === "COMPLETED") {
            throw new ValidationError(
                "Cannot delete an active or completed phase. Please archive the project instead.",
            );
        }

        await prisma.phase.delete({
            where: { id: phaseId },
        });
    },
};

export default phaseService;