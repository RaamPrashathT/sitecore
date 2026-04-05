import { prisma } from "../../shared/lib/prisma.js";
import type { SetDashboardItemsType } from "./dashboard.schema.js";

const dashboardService = {
    async getDashboardItems(organizationId: string, searchQuery: string) {
        const whereClause: any = {
            status: "UNORDERED",
            requisition: {
                status: "APPROVED",
                phase: { project: { organizationId } },
            },
        };

        if (searchQuery) {
            whereClause.OR = [
                {
                    catalogue: {
                        name: { contains: searchQuery, mode: "insensitive" },
                    },
                },
                {
                    requisition: {
                        phase: {
                            project: {
                                name: {
                                    contains: searchQuery,
                                    mode: "insensitive",
                                },
                            },
                        },
                    },
                },
                {
                    assignedSupplier: {
                        supplier: {
                            contains: searchQuery,
                            mode: "insensitive",
                        },
                    },
                },
            ];
        }

        const [result, count] = await Promise.all([
            prisma.requisitionItem.findMany({
                where: whereClause,
                select: {
                    id: true,
                    quantity: true,
                    estimatedUnitCost: true,
                    catalogue: {
                        select: {
                            name: true,
                            unit: true,
                        },
                    },
                    assignedSupplier: {
                        select: {
                            supplier: true,
                            leadTime: true,
                            truePrice: true,
                            standardRate: true,
                            inventory: true,
                        },
                    },
                    requisition: {
                        select: {
                            phase: {
                                select: {
                                    name: true,
                                    startDate: true,
                                    project: {
                                        select: {
                                            id: true,
                                            name: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    requisition: {
                        phase: {
                            startDate: "asc",
                        },
                    },
                },
            }),
            prisma.requisitionItem.count({
                where: whereClause,
            }),
        ]);

        const data = result.map((item) => ({
            id: item.id,
            quantity: Number(item.quantity),
            estimatedUnitCost: Number(item.estimatedUnitCost),
            itemName: item.catalogue.name,
            unit: item.catalogue.unit,
            supplierName: item.assignedSupplier?.supplier,
            leadTime: item.assignedSupplier?.leadTime ?? 0,
            truePrice: item.assignedSupplier
                ? Number(item.assignedSupplier.truePrice)
                : undefined,
            standardRate: item.assignedSupplier
                ? Number(item.assignedSupplier.standardRate)
                : undefined,
            projectid: item.requisition.phase.project.id,
            projectName: item.requisition.phase.project.name,
            phaseName: item.requisition.phase.name,
            phaseStartDate: item.requisition.phase.startDate,
            inventory: item.assignedSupplier?.inventory ?? 0,
        }));

        console.log(data);
        return {
            data,
            count,
        };
    },

    async orderItem({
        requisitionItemId,
        deductInventoryQty,
        organizationId,
    }: {
        requisitionItemId: string;
        deductInventoryQty: number;
        organizationId: string;
    }) {
        // Use a transaction to ensure both operations succeed or fail together
        return await prisma.$transaction(async (tx) => {
            // 1. Verify the item belongs to the org and is currently UNORDERED
            const item = await tx.requisitionItem.findFirst({
                where: {
                    id: requisitionItemId,
                    status: "UNORDERED",
                    requisition: {
                        status: "APPROVED",
                        phase: {
                            project: { organizationId },
                        },
                    },
                },
                include: { assignedSupplier: true },
            });

            if (!item) {
                throw new Error(
                    "Requisition item not found or already ordered",
                );
            }

            // 2. Mark the requisition item as ORDERED
            const updatedItem = await tx.requisitionItem.update({
                where: { id: requisitionItemId },
                data: { status: "ORDERED" },
            });

            if (deductInventoryQty > 0 && item.assignedSupplierId) {
                await tx.supplierQuote.update({
                    where: { id: item.assignedSupplierId },
                    data: {
                        inventory: {
                            decrement: deductInventoryQty,
                        },
                    },
                });
            }

            return updatedItem;
        });
    },

    async getEngineerDashboardItems(
        engineerId: string,
        organizationId: string,
        searchQuery: string,
    ) {
        const whereClause: any = {
            status: "ACTIVE",
            project: {
                organizationId: organizationId,
                assignments: {
                    some: {
                        userId: engineerId,
                    },
                },
            },
        };

        if (searchQuery) {
            whereClause.name = { contains: searchQuery, mode: "insensitive" };
        }

        const [result, count] = await Promise.all([
            prisma.phase.findMany({
                where: whereClause,
                select: {
                    id: true,
                    name: true,
                    description: true,
                    budget: true,
                    project: {
                        select: {
                            name: true,
                        },
                    },
                    requisitions: {
                        where: {
                            status: "APPROVED",
                        },
                        select: {
                            items: {
                                select: {
                                    id: true,
                                    quantity: true,
                                    estimatedUnitCost: true,
                                    status: true,
                                    catalogue: {
                                        select: {
                                            name: true,
                                            unit: true,
                                        },
                                    },
                                    assignedSupplier: {
                                        select: {
                                            supplier: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
            }),
            prisma.phase.count({
                where: whereClause,
            }),
        ]);

        const flattenedPhases = result.map((phase) => {
            const flatItems = phase.requisitions.flatMap((req) =>
                req.items.map((item) => ({
                    id: item.id,
                    quantity: Number(item.quantity),
                    estimatedUnitCost: Number(item.estimatedUnitCost),
                    status: item.status as "ORDERED" | "UNORDERED",
                    itemName: item.catalogue.name,
                    unit: item.catalogue.unit,
                    supplierName:
                        item.assignedSupplier?.supplier || "Pending Assignment",
                })),
            );

            return {
                id: phase.id,
                name: phase.name,
                description: phase.description,
                budget: Number(phase.budget),
                projectName: phase.project.name,
                items: flatItems,
            };
        });

        return {
            data: flattenedPhases,
            count,
        };
    },

    async getClientDashboardItems(
        clientId: string,
        organizationId: string,
        searchQuery: string,
    ) {
        const whereClause: any = {
            status: "PAYMENT_PENDING",
            isPaid: false,
            project: {
                organizationId: organizationId,
                assignments: {
                    some: {
                        userId: clientId,
                    },
                },
            },
        };

        if (searchQuery) {
            whereClause.name = { contains: searchQuery, mode: "insensitive" };
        }

        const [result, count] = await Promise.all([
            prisma.phase.findMany({
                where: whereClause,
                select: {
                    id: true,
                    name: true,
                    budget: true,
                    project: {
                        select: {
                            name: true,
                            estimatedBudget: true,
                        },
                    },
                    paymentDeadline: true,
                },
            }),
            prisma.phase.count({
                where: whereClause,
            }),
        ]);

        const items = result.map((phase) => ({
            id: phase.id,
            name: phase.name,
            budget: Number(phase.budget),
            projectName: phase.project.name,
            estimatedBudget: Number(phase.project.estimatedBudget),
            paymentDeadline: phase.paymentDeadline,
        }));
        return {
            data: items,
            count,
        };
    },

    async getPendingApprovalsSummary(organizationId: string) {
        const [pendingPayments, pendingRequisitions] = await Promise.all([
            // 1. Fetch Phases waiting on Client Payment
            prisma.phase.findMany({
                where: {
                    status: "PAYMENT_PENDING",
                    isPaid: false,
                    project: { organizationId },
                },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    budget: true,
                    project: {
                        select: { name: true },
                    },
                },
                orderBy: { paymentDeadline: "asc" },
                take: 5, // Just grab the top 5 for the sidebar
            }),

            // 2. Fetch Requisitions waiting on Admin Approval
            prisma.requisition.findMany({
                where: {
                    status: "PENDING_APPROVAL",
                    phase: { project: { organizationId } },
                },
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    budget: true,
                    requestedBy: true,
                    phase: {
                        select: { name: true },
                    },
                },
                orderBy: { createdAt: "asc" },
                take: 5,
            }),
        ]);

        return {
            pendingPayments: pendingPayments.map((p) => ({
                id: p.id,
                title: p.name,
                projectName: p.project.name,
                slug: p.slug,
                amount: Number(p.budget),
                type: "VENDOR_PAYMENT",
            })),
            pendingRequisitions: pendingRequisitions.map((r) => ({
                id: r.id,
                title: r.title,
                phaseName: r.phase.name,
                slug: r.slug,
                amount: Number(r.budget),
                requestedBy: r.requestedBy,
                type: "MATERIAL_ORDER",
            })),
        };
    },

    async getRequisitionBySlug(organizationId: string, reqSlug: string) {
        const requisition = await prisma.requisition.findFirst({
            where: {
                slug: reqSlug,
                phase: {
                    project: { organizationId },
                },
            },
            select: {
                id: true,
                title: true,
                slug: true,
                status: true,
                budget: true,
                requestedBy: true,
                createdAt: true,
                phase: {
                    select: {
                        name: true,
                        project: {
                            select: { name: true },
                        },
                    },
                },
                items: {
                    select: {
                        id: true,
                        quantity: true,
                        estimatedUnitCost: true,
                        status: true,
                        catalogue: {
                            select: {
                                name: true,
                                unit: true,
                            },
                        },
                        assignedSupplier: {
                            select: {
                                supplier: true,
                                truePrice: true,
                                standardRate: true,
                            },
                        },
                    },
                },
            },
        });

        if (!requisition) {
            throw new Error("Requisition not found");
        }

        // Flatten the data for a clean frontend response
        return {
            id: requisition.id,
            title: requisition.title,
            slug: requisition.slug,
            status: requisition.status,
            budget: Number(requisition.budget),
            requestedBy: requisition.requestedBy,
            createdAt: requisition.createdAt,
            phaseName: requisition.phase.name,
            projectName: requisition.phase.project.name,
            items: requisition.items.map((item) => ({
                id: item.id,
                itemName: item.catalogue.name,
                unit: item.catalogue.unit,
                quantity: Number(item.quantity),
                estimatedUnitCost: Number(item.estimatedUnitCost),
                status: item.status,
                supplierName: item.assignedSupplier?.supplier,
                truePrice: item.assignedSupplier
                    ? Number(item.assignedSupplier.truePrice)
                    : undefined,
                standardRate: item.assignedSupplier
                    ? Number(item.assignedSupplier.standardRate)
                    : undefined,
            })),
        };
    },

    async getPendingPaymentById(organizationId: string, phaseId: string) {
        const phase = await prisma.phase.findFirst({
            where: {
                id: phaseId,
                project: { organizationId },
            },
            select: {
                id: true,
                name: true,
                budget: true,
                paymentDeadline: true,
                status: true,
                isPaid: true,
                project: {
                    select: { name: true },
                },
            },
        });

        if (!phase) throw new Error("Payment not found");

        return {
            id: phase.id,
            phaseName: phase.name,
            projectName: phase.project.name,
            budget: Number(phase.budget),
            paymentDeadline: phase.paymentDeadline,
            status: phase.status,
            isPaid: phase.isPaid,
        };
    },
    async approvePendingPayment(organizationId: string, phaseId: string) {
        // Verify it belongs to the org first
        const phase = await prisma.phase.findFirst({
            where: { id: phaseId, project: { organizationId } }
        });

        if (!phase) throw new Error("Phase not found");

        // Mark it as paid and active
        return await prisma.phase.update({
            where: { id: phaseId },
            data: {
                isPaid: true,
                status: "ACTIVE" 
            }
        });
    }
};

export default dashboardService;
