import { prisma } from "../../shared/lib/prisma.js";

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
                { catalogue: { name: { contains: searchQuery, mode: "insensitive" } } },
                { requisition: { phase: { project: { name: { contains: searchQuery, mode: "insensitive" } } } } },
                { assignedSupplier: { supplier: { name: { contains: searchQuery, mode: "insensitive" } } } }
            ];
        }

        const items = await prisma.requisitionItem.findMany({
            where: whereClause,
            include: {
                catalogue: true,
                assignedSupplier: { include: { supplier: true } },
                requisition: { include: { phase: { include: { project: true } } } },
            },
            orderBy: { requisition: { createdAt: "asc" } },
        });

        const data = items.map((item) => ({
            id: item.id,
            quantity: Number(item.quantity),
            estimatedUnitCost: Number(item.estimatedUnitCost),
            itemName: item.catalogue.name,
            unit: item.catalogue.unit,
            supplierName: item.assignedSupplier?.supplier?.name ?? undefined,
            leadTime: item.assignedSupplier?.leadTimeDays ?? item.catalogue.defaultLeadTime,
            truePrice: item.assignedSupplier ? Number(item.assignedSupplier.truePrice) : undefined,
            standardRate: item.assignedSupplier ? Number(item.assignedSupplier.standardRate) : undefined,
            projectid: item.requisition.phase.project.id,
            projectName: item.requisition.phase.project.name,
            phaseName: item.requisition.phase.name,
            phaseStartDate: item.requisition.phase.startDate?.toISOString() ?? new Date().toISOString(),
            inventory: item.catalogue.category,
        }));

        return { data, count: data.length };
    },

    async orderItem(requisitionItemId: string, organizationId: string, deductInventoryQty?: number) {
        // We simply mark it as ordered. We skip the physical inventory deduction here 
        // because we moved that logic to the SiteLog creation endpoint for the new billing engine.
        const updatedItem = await prisma.requisitionItem.update({
            where: { id: requisitionItemId },
            data: { status: "ORDERED" },
            include: {
                catalogue: true,
                requisition: { include: { phase: { include: { project: true } } } }
            }
        });

        return updatedItem;
    },

    async getEngineerDashboardItems(organizationId: string, userId: string, searchQuery: string) {
        // Preserving original return structure for engineer active phases
        return prisma.phase.findMany({
            where: {
                status: "ACTIVE",
                project: {
                    organizationId,
                    name: { contains: searchQuery, mode: "insensitive" },
                    assignments: { some: { userId } },
                },
            },
            include: {
                project: true,
                requisitions: {
                    where: { status: "APPROVED" },
                    include: { items: { include: { catalogue: true } } },
                },
            },
        });
    },

    async getClientDashboardItems(organizationId: string, userId: string) {
        // Preserving original client project views
        return prisma.project.findMany({
             where: { 
                 organizationId, 
                 assignments: { some: { userId } } 
             },
             include: {
                  phases: {
                      where: { status: { in: ["PAYMENT_PENDING", "ACTIVE"] } },
                      include: { invoices: true } // Added so they can see new bills
                  }
             }
        });
    },

    async getPendingApprovalsSummary(organizationId: string) {
        // FETCH ARRAYS INSTEAD OF COUNTS TO FIX FRONTEND .map() CRASH
        const pendingRequisitionsData = await prisma.requisition.findMany({
            where: {
                status: "PENDING_APPROVAL",
                phase: { project: { organizationId } },
            },
            take: 5, // Limit for sidebar
            include: {
                phase: { include: { project: true } },
            },
            orderBy: { createdAt: "desc" }
        });

        const pendingRequisitions = pendingRequisitionsData.map((req) => ({
            id: req.id,
            title: req.title,
            slug: req.slug,
            projectName: req.phase.project.name,
            budget: Number(req.budget)
        }));

        const pendingPaymentsData = await prisma.phase.findMany({
            where: {
                status: "PAYMENT_PENDING",
                project: { organizationId }
            },
            take: 5,
            include: { project: true },
            orderBy: { createdAt: "desc" }
        });

        const pendingPayments = pendingPaymentsData.map((phase) => ({
            id: phase.id,
            title: phase.name,
            projectName: phase.project.name,
            slug: phase.slug,
            amount: Number(phase.budget),
            type: "VENDOR_PAYMENT"
        }));

        return {
            pendingRequisitions,
            pendingPayments
        };
    },

    async getRequisitionBySlug(organizationId: string, reqSlug: string) {
        const req = await prisma.requisition.findFirst({
            where: { slug: reqSlug, phase: { project: { organizationId } } },
            include: {
                items: { include: { catalogue: true, assignedSupplier: { include: { supplier: true } } } },
                phase: { include: { project: true } }
            }
        });
        if (!req) throw new Error("Not found");
        return req;
    },

    async getPendingPaymentById(organizationId: string, phaseId: string) {
        const phase = await prisma.phase.findFirst({
            where: {
                id: phaseId,
                status: "PAYMENT_PENDING",
                project: { organizationId }
            },
            include: { project: true }
        });
        if (!phase) throw new Error("Payment not found");
        return phase;
    },

    async approvePendingPayment(organizationId: string, phaseId: string) {
        // We only update the status now. We removed `isPaid: true` from the schema.
        const updatedPhase = await prisma.phase.update({
            where: { id: phaseId },
            data: { status: "ACTIVE" }
        });
        return updatedPhase;
    }
};

export default dashboardService;