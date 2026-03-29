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
        }
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
                orderBy: { sequenceOrder: 'desc' },
                select: { sequenceOrder: true }
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

    async updatePhase(
        projectId: string, 
        phaseId: string, 
        data: {
            name?: string | undefined;
            description?: string | undefined;
            startDate?: Date | undefined;
            budget?: number | undefined;
            paymentDeadline?: Date | undefined;
        }
    ) {
        const phase = await prisma.phase.findUnique({
            where: { 
                id: phaseId,
                projectId: projectId 
            }
        });

        if (!phase) {
            throw new ValidationError("Phase not found");
        }

        const isLocked = phase.status === "ACTIVE" || phase.status === "COMPLETED";

        if (isLocked) {
            if (data.budget !== undefined && Number(data.budget) !== Number(phase.budget)) {
                throw new ValidationError("Cannot modify the budget of a phase that is already active or completed.");
            }
            if (data.startDate !== undefined && data.startDate.getTime() !== phase.startDate.getTime()) {
                throw new ValidationError("Cannot modify the start date of a phase that is already active or completed.");
            }

            delete data.budget;
            delete data.startDate;
        }

        const updatePayload = Object.fromEntries(
            Object.entries(data).filter(([_, value]) => value !== undefined)
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
                projectId: projectId 
            }
        });

        if (!phase) {
            throw new ValidationError("Phase not found");
        }

        if (phase.status === "ACTIVE" || phase.status === "COMPLETED") {
            throw new ValidationError("Cannot delete a phase that has already received payment or is completed. Please archive the project instead.");
        }

        await prisma.phase.delete({
            where: { id: phaseId }
        });
    },

    async requestPayment(projectId: string, phaseId: string) {
        const phase = await prisma.phase.findUnique({
            where: { id: phaseId, projectId }
        });

        if (!phase) throw new ValidationError("Phase not found");
        if (phase.status !== "PLANNING") {
            throw new ValidationError("Only phases in PLANNING status can request payment.");
        }

        await prisma.phase.update({
            where: { id: phaseId },
            data: { status: "PAYMENT_PENDING" }
        });
    },

    async approvePayment(projectId: string, phaseId: string) {
        const phase = await prisma.phase.findUnique({
            where: { id: phaseId, projectId }
        });

        if (!phase) throw new ValidationError("Phase not found");
        if (phase.status !== "PAYMENT_PENDING") {
            throw new ValidationError("Phase must be PAYMENT_PENDING to approve payment.");
        }

        await prisma.phase.update({
            where: { id: phaseId },
            data: { 
                status: "ACTIVE",
                isPaid: true,
                startDate: new Date(),
            }
        });
    },

    async completePhase(projectId: string, phaseId: string) {
        const phase = await prisma.phase.findUnique({
            where: { id: phaseId, projectId }
        });

        if (!phase) throw new ValidationError("Phase not found");
        if (phase.status !== "ACTIVE") {
            throw new ValidationError("Only an ACTIVE phase can be marked as completed.");
        }

        const pendingRequisition = await prisma.requisition.findFirst({
            where: {
                phaseId: phaseId,
                status: "PENDING_APPROVAL"
            }
        });
        if (pendingRequisition) {
            throw new ValidationError("Cannot complete phase: There are material requisitions awaiting admin approval.");
        }

        const unorderedItem = await prisma.requisitionItem.findFirst({
            where: {
                requisition: { phaseId: phaseId },
                status: "UNORDERED"
            }
        });
        if (unorderedItem) {
            throw new ValidationError("Cannot complete phase: There are materials in the requisitions that have not been ordered yet.");
        }

        await prisma.phase.update({
            where: { id: phaseId },
            data: { status: "COMPLETED" }
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
                    phase.project.assignments.map((assignment) => assignment.userId)
                )
            )
        ];

        const { User } = await import("../../../shared/models/user.js");
        const clients = await User.find({
            _id: { $in: userIds },
        }).lean();

        const clientMap = new Map(
            clients.map((client) => [client._id.toString(), client.username])
        );

        const data = result.map((phase) => {
            const firstClientId = phase.project.assignments[0]?.userId?.toString();
            return {
                id: phase.id,
                phaseName: phase.name,
                projectName: phase.project.name,
                budget: Number(phase.budget),
                paymentDeadline: phase.paymentDeadline,
                clientName: (firstClientId ? clientMap.get(firstClientId) : null) || "Unassigned",
            };
        });

        return { data };
    }
};

export default phaseService;