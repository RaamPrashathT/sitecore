import { prisma } from "../../shared/lib/prisma.js";
import type { SetDashboardItemsType } from "./dashboard.schema.js";

const dashboardService = {
    async getDashboardItems(
        organizationId: string,
        searchQuery: string,
    ) {
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

    async setDashboardItems({
        requisitionItemIds,
        organizationId,
    }: SetDashboardItemsType) {
        const result = await prisma.requisitionItem.updateMany({
            where: {
                id: {
                    in: requisitionItemIds,
                },
                requisition: {
                    status: "APPROVED",
                    phase: {
                        project: {
                            organizationId,
                        },
                    },
                },
            },
            data: {
                status: "ORDERED",
            },
        });

        return result;
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
};

export default dashboardService;
