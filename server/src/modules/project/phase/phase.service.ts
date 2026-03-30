import { ValidationError } from "../../../shared/error/validation.error.js";
import { prisma } from "../../../shared/lib/prisma.js";

const phaseService = {
    async createPhase(
        projectId: string,
        data: {
            name: string;
            description?: string | undefined;
            budget: number;
            startDate: Date;
            paymentDeadline: Date;
            prevOrder?: number | undefined;
            nextOrder?: number | undefined;
        },
    ) {
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
                budget: data.budget,
                startDate: data.startDate,
                paymentDeadline: data.paymentDeadline,
                sequenceOrder: calculatedOrder,
                status: "PLANNING",
            },
        });

        return {
            id: phase.id,
            name: phase.name,
            sequenceOrder: phase.sequenceOrder,
            status: phase.status,
        };
    },

    async getPhases(projectId: string) {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                phases: {
                    orderBy: { sequenceOrder: "asc" },
                    select: {
                        id: true,
                        name: true,
                        status: true,
                        startDate: true,
                        sequenceOrder: true,
                        budget: true,
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

        const mappedPhases = project.phases.map((phase) => {
            const phaseSpent = phase.requisitions.reduce(
                (sum, req) => sum + Number(req.budget),
                0,
            );
            totalSpent += phaseSpent;

            return {
                id: phase.id,
                name: phase.name,
                status: phase.status,
                startDate: phase.startDate,
                sequenceOrder: Number(phase.sequenceOrder),
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
                overallProgress: overallProgress,
            },
            phases: mappedPhases,
        };
    },

    async getPhaseDetails(projectId: string, phaseId: string) {
        const phase = await prisma.phase.findUnique({
            where: { id: phaseId, projectId: projectId },
            include: {
                requisitions: {
                    orderBy: { createdAt: "desc" },
                    include: {
                        items: {
                            include: {
                                catalogue: true,
                                assignedSupplier: true,
                            },
                        },
                    },
                },
                siteLogs: {
                    orderBy: { workDate: "desc" },
                    include: {
                        author: { select: { userId: true } },
                        images: {
                            include: { _count: { select: { comments: true } } },
                        },
                    },
                },
            },
        });

        if (!phase) {
            throw new ValidationError("Phase not found");
        }

        const spent = phase.requisitions
            .filter((req) => req.status === "APPROVED")
            .reduce((sum, req) => sum + Number(req.budget), 0);

        const isOverdue = phase.paymentDeadline < new Date() && !phase.isPaid;

        const authorUserIds = [
            ...new Set(phase.siteLogs.map((log) => log.author.userId)),
        ];
        const { User } = await import("../../../shared/models/user.js");
        const users = await User.find({ _id: { $in: authorUserIds } }).lean();
        const userMap = new Map(users.map((u) => [u._id.toString(), u]));

        const mappedRequisitions = phase.requisitions.map((req) => {
            const firstItemName =
                req.items[0]?.catalogue?.name || "Various materials";
            return {
                id: req.id,
                status: req.status,
                budget: Number(req.budget),
                itemsSummary: firstItemName,
                // Add this new items array for your DataTable!
                items: req.items.map((item) => ({
                    id: item.id,
                    itemName: item.catalogue.name,
                    unit: item.catalogue.unit,
                    quantity: Number(item.quantity),
                    estimatedUnitCost: Number(item.estimatedUnitCost),
                    supplierName:
                        item.assignedSupplier?.supplier || "Unknown supplier",
                    standardRate: item.assignedSupplier
                        ? Number(item.assignedSupplier.standardRate)
                        : Number(item.estimatedUnitCost),
                })),
            };
        });

        const mappedSiteLogs = phase.siteLogs.map((log) => {
            const mongoUser = userMap.get(log.author.userId);
            const authorName = mongoUser ? mongoUser.username : "Unknown User";
            const profile = mongoUser?.profileImage;

            const totalComments = log.images.reduce(
                (sum, img) => sum + img._count.comments,
                0,
            );

            return {
                id: log.id,
                title: log.title,
                description: log.description,
                workDate: log.workDate,
                author: {
                    profile: profile,
                    name: authorName,
                },
                images: log.images.map((img) => img.url),
                commentCount: totalComments,
            };
        });

        return {
            phaseSnapshot: {
                id: phase.id,
                name: phase.name,
                status: phase.status,
                budget: Number(phase.budget),
                spent: spent,
                paymentDeadline: phase.paymentDeadline,
                isOverdue: isOverdue,
            },
            requisitions: mappedRequisitions,
            siteLogs: mappedSiteLogs,
        };
    },

    async updatePhase(
        projectId: string,
        phaseId: string,
        data: {
            name?: string | undefined;
            description?: string | undefined;
            startDate?: Date | undefined;
            budget?: number | undefined;
            paymentDeadline?: Date | undefined;
        },
    ) {
        const phase = await prisma.phase.findUnique({
            where: {
                id: phaseId,
                projectId: projectId,
            },
        });

        if (!phase) {
            throw new ValidationError("Phase not found");
        }

        const isLocked =
            phase.status === "ACTIVE" || phase.status === "COMPLETED";

        if (isLocked) {
            if (
                data.budget !== undefined &&
                Number(data.budget) !== Number(phase.budget)
            ) {
                throw new ValidationError(
                    "Cannot modify the budget of a phase that is already active or completed.",
                );
            }
            if (
                data.startDate !== undefined &&
                data.startDate.getTime() !== phase.startDate.getTime()
            ) {
                throw new ValidationError(
                    "Cannot modify the start date of a phase that is already active or completed.",
                );
            }

            delete data.budget;
            delete data.startDate;
        }

        const updatePayload = Object.fromEntries(
            Object.entries(data).filter(([_, value]) => value !== undefined),
        );

        const updatedPhase = await prisma.phase.update({
            where: { id: phaseId },
            data: updatePayload,
        });

        return {
            id: updatedPhase.id,
            name: updatedPhase.name,
            status: updatedPhase.status,
            budget: Number(updatedPhase.budget),
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
                "Cannot delete a phase that has already received payment or is completed. Please archive the project instead.",
            );
        }

        await prisma.phase.delete({
            where: { id: phaseId },
        });
    },

    async requestPayment(projectId: string, phaseId: string) {
        const phase = await prisma.phase.findUnique({
            where: { id: phaseId, projectId },
        });

        if (!phase) throw new ValidationError("Phase not found");
        if (phase.status !== "PLANNING") {
            throw new ValidationError(
                "Only phases in PLANNING status can request payment.",
            );
        }

        await prisma.phase.update({
            where: { id: phaseId },
            data: { status: "PAYMENT_PENDING" },
        });
    },

    async approvePayment(projectId: string, phaseId: string) {
        const phase = await prisma.phase.findUnique({
            where: { id: phaseId, projectId },
        });

        if (!phase) throw new ValidationError("Phase not found");
        if (phase.status !== "PAYMENT_PENDING") {
            throw new ValidationError(
                "Phase must be PAYMENT_PENDING to approve payment.",
            );
        }

        await prisma.phase.update({
            where: { id: phaseId },
            data: {
                status: "ACTIVE",
                isPaid: true,
                startDate: new Date(),
            },
        });
    },

    async completePhase(projectId: string, phaseId: string) {
        const phase = await prisma.phase.findUnique({
            where: { id: phaseId, projectId },
        });

        if (!phase) throw new ValidationError("Phase not found");
        if (phase.status !== "ACTIVE") {
            throw new ValidationError(
                "Only an ACTIVE phase can be marked as completed.",
            );
        }

        const pendingRequisition = await prisma.requisition.findFirst({
            where: {
                phaseId: phaseId,
                status: "PENDING_APPROVAL",
            },
        });
        if (pendingRequisition) {
            throw new ValidationError(
                "Cannot complete phase: There are material requisitions awaiting admin approval.",
            );
        }

        const unorderedItem = await prisma.requisitionItem.findFirst({
            where: {
                requisition: { phaseId: phaseId },
                status: "UNORDERED",
            },
        });
        if (unorderedItem) {
            throw new ValidationError(
                "Cannot complete phase: There are materials in the requisitions that have not been ordered yet.",
            );
        }

        await prisma.phase.update({
            where: { id: phaseId },
            data: { status: "COMPLETED" },
        });
    },

    async getPaymentPendingPhases(organizationId: string) {
        const result = await prisma.phase.findMany({
            where: {
                status: "PAYMENT_PENDING",
                isPaid: false,
                project: {
                    organizationId: organizationId,
                },
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
                            where: { role: "CLIENT" },
                            select: { userId: true },
                        },
                    },
                },
            },
            orderBy: {
                paymentDeadline: "asc",
            },
        });

        const userIds = [
            ...new Set(
                result.flatMap((phase) =>
                    phase.project.assignments.map(
                        (assignment) => assignment.userId,
                    ),
                ),
            ),
        ];

        const { User } = await import("../../../shared/models/user.js");
        const clients = await User.find({
            _id: { $in: userIds },
        }).lean();

        const clientMap = new Map(
            clients.map((client) => [client._id.toString(), client.username]),
        );

        const data = result.map((phase) => {
            const firstClientId =
                phase.project.assignments[0]?.userId?.toString();
            return {
                id: phase.id,
                phaseName: phase.name,
                projectName: phase.project.name,
                budget: Number(phase.budget),
                paymentDeadline: phase.paymentDeadline,
                clientName:
                    (firstClientId ? clientMap.get(firstClientId) : null) ||
                    "Unassigned",
            };
        });

        return { data };
    },
};

export default phaseService;
