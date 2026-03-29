import { ValidationError } from "../../../shared/error/validation.error.js";
import { prisma } from "../../../shared/lib/prisma.js";

const requisitionService = {
    async createRequisition(
        projectId: string,
        phaseId: string,
        requestedBy: string,
        items: Array<{
            catalogueId: string;
            quantity: number;
            estimatedUnitCost: number;
            assignedSupplierId?: string | undefined;
        }>
    ) {
        const phase = await prisma.phase.findUnique({
            where: { id: phaseId, projectId: projectId }
        });

        if (!phase) {
            throw new ValidationError("Phase not found or does not belong to this project.");
        }

        const totalBudget = items.reduce((sum, item) => {
            return sum + (item.quantity * item.estimatedUnitCost);
        }, 0);

        const requisition = await prisma.requisition.create({
            data: {
                phaseId: phaseId,
                requestedBy: requestedBy,
                budget: totalBudget,
                status: "PENDING_APPROVAL",
                items: {
                    createMany: {
                        data: items.map(item => {
                            const itemData: any = {
                                catalogueId: item.catalogueId,
                                quantity: item.quantity,
                                estimatedUnitCost: item.estimatedUnitCost,
                                status: "UNORDERED"
                            };

                            if (item.assignedSupplierId !== undefined) {
                                itemData.assignedSupplierId = item.assignedSupplierId;
                            }

                            return itemData;
                        })
                    }
                }
            },
            include: {
                items: true
            }
        });

        return {
            id: requisition.id,
            status: requisition.status,
            budget: Number(requisition.budget),
            itemCount: requisition.items.length
        };
    },

    async approveRequisition(projectId: string, requisitionId: string) {
        const requisition = await prisma.requisition.findFirst({
            where: {
                id: requisitionId,
                phase: { projectId: projectId }
            }
        });

        if (!requisition) {
            throw new ValidationError("Requisition not found.");
        }

        if (requisition.status !== "PENDING_APPROVAL") {
            throw new ValidationError("Only pending requisitions can be approved.");
        }

        await prisma.requisition.update({
            where: { id: requisitionId },
            data: { status: "APPROVED" }
        });
    },

    async rejectRequisition(projectId: string, requisitionId: string) {
        const requisition = await prisma.requisition.findFirst({
            where: {
                id: requisitionId,
                phase: { projectId: projectId }
            }
        });

        if (!requisition) {
            throw new ValidationError("Requisition not found.");
        }

        if (requisition.status !== "PENDING_APPROVAL") {
            throw new ValidationError("Only pending requisitions can be rejected.");
        }

        await prisma.requisition.update({
            where: { id: requisitionId },
            data: { status: "REJECTED" }
        });
    }
};

export default requisitionService;