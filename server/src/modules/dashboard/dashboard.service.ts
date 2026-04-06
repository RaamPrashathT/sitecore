import { notify } from "../../shared/lib/notify.js";
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
    ) {
        const projects = await prisma.project.findMany({
            where: {
                organizationId,
                assignments: { some: { userId: engineerId } },
            },
            include: {
                phases: {
                    include: {
                        requisitions: {
                            orderBy: { createdAt: "desc" },
                        },
                        siteLogs: {
                            orderBy: { createdAt: "desc" },
                            take: 5,
                            include: {
                                comments: {
                                    orderBy: { createdAt: "desc" },
                                    take: 3,
                                },
                            },
                        },
                    },
                },
            },
        });

        const activeProjects: any[] = [];
        const actionablePhases: any[] = [];
        const recentRequisitions: any[] = [];
        const allLogs: any[] = [];

        for (const project of projects) {
            let activePhase = null;

            for (const phase of project.phases) {
                if (phase.status === "ACTIVE") {
                    activePhase = phase;

                    // A. Alert: Active Phase but NO Requisition drafted yet
                    if (phase.requisitions.length === 0) {
                        actionablePhases.push({
                            phaseId: phase.id,
                            phaseName: phase.name,
                            projectName: project.name,
                            projectSlug: project.slug,
                            phaseSlug: phase.slug,
                        });
                    }
                }

                // B. Requisitions Tracker
                for (const req of phase.requisitions) {
                    recentRequisitions.push({
                        id: req.id,
                        title: req.title,
                        status: req.status,
                        createdAt: req.createdAt,
                        slug: req.slug,
                        phaseName: phase.name,
                        projectName: project.name,
                    });
                }

                for (const log of phase.siteLogs) {
                    allLogs.push({
                        id: log.id,
                        title: log.title,
                        createdAt: log.createdAt,
                        phaseName: phase.name,
                        projectName: project.name,
                        comments: log.comments.map((c: any) => ({
                            id: c.id,
                            text: c.text || c.content,
                            createdAt: c.createdAt,
                        })),
                    });
                }
            }

            if (project.status === "ACTIVE") {
                activeProjects.push({
                    id: project.id,
                    name: project.name,
                    slug: project.slug,
                    activePhase: activePhase
                        ? {
                              name: activePhase.name,
                              deadline: activePhase.paymentDeadline || null,
                          }
                        : null,
                });
            }
        }

        // Sort globally by newest first
        recentRequisitions.sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
        );
        allLogs.sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
        );

        return {
            activeProjects,
            actionablePhases,
            recentRequisitions: recentRequisitions.slice(0, 8), // Top 8 recent reqs
            recentLogs: allLogs.slice(0, 10), // Top 10 recent logs across sites
        };
    },

    async getClientDashboardItems(organizationId: string, userId: string) {
        const projects = await prisma.project.findMany({
            where: {
                organizationId,
                assignments: {
                    some: { userId, role: "CLIENT" }
                }
            },
            include: {
                phases: {
                    include: {
                        siteLogs: true, 
                        
                        requisitions: {
                            include: {
                                items: {
                                    include: { 
                                        assignedSupplier: { select: { truePrice: true } } 
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        const pendingPayments: any[] = [];
        const projectSummaries: any[] = [];

        for (const project of projects) {
            let totalOrderedCost = 0; 
            let activePhase = null;
            let completedPhases = 0;
            const allLogs: any[] = [];

            for (const phase of project.phases) {
                if (phase.status === "PAYMENT_PENDING" && !phase.isPaid) {
                    pendingPayments.push({
                        id: phase.id,
                        phaseName: phase.name,
                        projectName: project.name,
                        budget: Number(phase.budget),
                        phaseSlug: phase.slug,
                        projectSlug: project.slug,
                        paymentDeadline: phase.paymentDeadline.toISOString(),
                        slug: phase.slug,
                    });
                }

                // B. Check phase statuses
                if (phase.status === "ACTIVE") {
                    activePhase = { id: phase.id, name: phase.name };
                }
                if (phase.status === "COMPLETED") {
                    completedPhases++;
                }

                // C. Collect ALL site logs for THIS specific phase
                for (const log of phase.siteLogs) {
                    allLogs.push({
                        id: log.id,
                        title: log.title,
                        phaseSlug: phase.slug,       // <-- CHANGED: Pull directly from the 'phase' object
                        projectSlug: project.slug,   // <-- CHANGED: Pull directly from the 'project' object
                        createdAt: log.createdAt,
                        phaseName: phase.name 
                    });
                }

                for (const req of phase.requisitions) {
                    for (const item of req.items) {
                        const price = item.assignedSupplier?.truePrice
                            ? Number(item.assignedSupplier.truePrice)
                            : Number(item.estimatedUnitCost);
                            
                        totalOrderedCost += (price * Number(item.quantity));
                    }
                }
            }

            const recentLogs = allLogs
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                .map(log => ({
                    id: log.id,
                    title: log.title,
                    phaseSlug: log.phaseSlug,
                    projectSlug: log.projectSlug,
                    createdAt: log.createdAt.toISOString(),
                    phaseName: log.phaseName
                }));

            // 4. Calculate a rough completion percentage based on completed phases
            const completionPercentage = project.phases.length > 0
                ? Math.round((completedPhases / project.phases.length) * 100) 
                : 0;

            projectSummaries.push({
                id: project.id,
                name: project.name,
                slug: project.slug,
                status: project.status,
                estimatedBudget: Number(project.estimatedBudget),
                totalOrderedCost,
                completionPercentage,
                activePhase,
                recentLogs 
            });
        }

        return {
            pendingPayments,
            projects: projectSummaries
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
        // 1. Verify it belongs to the org and grab all the slugs we need for the URL
        const phase = await prisma.phase.findFirst({
            where: { id: phaseId, project: { organizationId } },
            include: {
                project: {
                    select: {
                        id: true,
                        slug: true,
                        name: true,
                        organization: {
                            select: { slug: true },
                        },
                    },
                },
            },
        });

        if (!phase) throw new Error("Phase not found");

        // 2. Mark it as paid and active
        const updatedPhase = await prisma.phase.update({
            where: { id: phaseId },
            data: {
                isPaid: true,
                status: "ACTIVE",
            },
        });

        await notify({
            type: "PHASE_STATUS_CHANGED",
            title: "Phase Payment Approved",
            body: `Payment for ${phase.name} (${phase.project.name}) has been approved. The phase is now ACTIVE.`,
            entityType: "PHASE",
            entityId: phase.id,
            projectId: phase.project.id,
            orgId: organizationId,
            actionUrl: `/${phase.project.organization.slug}/${phase.project.slug}/progress/${phase.slug}`,
        });

        return updatedPhase;
    },
};

export default dashboardService;
