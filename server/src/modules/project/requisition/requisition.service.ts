import { ValidationError } from "../../../shared/error/validation.error.js";
import { prisma } from "../../../shared/lib/prisma.js";
import { User } from "../../../shared/models/user.js";

const requisitionService = {
    async createRequisition(
        projectId: string,
        phaseId: string,
        requestedBy: string,
        data: {
            title: string;
            items: Array<{
                catalogueId: string;
                quantity: number;
                estimatedUnitCost: number;
                assignedSupplierId?: string | undefined;
            }>;
        }
    ) {
        const phase = await prisma.phase.findUnique({
            where: { id: phaseId, projectId: projectId },
        });

        if (!phase) {
            throw new ValidationError("Phase not found or does not belong to this project.");
        }

        const slugBase = data.title.toLowerCase().trim().replace(/[\s\W-]+/g, '-').replace(/^-+|-+$/g, '');
        const lastReq = await prisma.requisition.findFirst({
            where: { phaseId: phaseId, slugBase: slugBase },
            orderBy: { slugIndex: "desc" },
        });

        const nextIndex = lastReq ? lastReq.slugIndex + 1 : 1;
        const currentSlug = nextIndex === 1 ? slugBase : `${slugBase}-${nextIndex}`;

        const totalBudget = data.items.reduce((sum, item) => {
            return sum + item.quantity * item.estimatedUnitCost;
        }, 0);

        const requisition = await prisma.requisition.create({
            data: {
                title: data.title,
                slug: currentSlug,
                slugBase: slugBase,
                slugIndex: nextIndex,
                phaseId: phaseId,
                requestedBy: requestedBy,
                budget: totalBudget,
                status: "PENDING_APPROVAL",
                items: {
                    createMany: {
                        data: data.items.map((item) => {
                            const itemData: any = {
                                catalogueId: item.catalogueId,
                                quantity: item.quantity,
                                estimatedUnitCost: item.estimatedUnitCost,
                                status: "UNORDERED",
                            };
                            if (item.assignedSupplierId !== undefined) {
                                itemData.assignedSupplierId = item.assignedSupplierId;
                            }
                            return itemData;
                        }),
                    },
                },
            },
            include: { items: true },
        });

        return {
            id: requisition.id,
            title: requisition.title,
            slug: requisition.slug,
            status: requisition.status,
            budget: Number(requisition.budget),
            itemCount: requisition.items.length,
        };
    },

    async getProjectRequisitions(projectId: string) {
        const phases = await prisma.phase.findMany({
            where: { projectId: projectId },
            orderBy: { sequenceOrder: "desc" },
            include: {
                requisitions: {
                    orderBy: { createdAt: "desc" },
                    include: {
                        items: { include: { catalogue: true, assignedSupplier: true } },
                    },
                },
            },
        });

        return phases.map((phase) => {
            const mappedRequisitions = phase.requisitions.map((req) => {
                return {
                    id: req.id,
                    title: req.title,
                    slug: req.slug,
                    status: req.status,
                    budget: Number(req.budget),
                    createdAt: req.createdAt,
                    itemsCount: req.items.length,
                };
            });

            return {
                id: phase.id,
                name: phase.name,
                slug: phase.slug,
                status: phase.status,
                budget: Number(phase.budget),
                requisitions: mappedRequisitions,
            };
        });
    },

    async getRequisitionDetails(projectId: string, phaseSlug: string, requisitionSlug: string) {
        const requisition = await prisma.requisition.findFirst({
            where: {
                slug: requisitionSlug,
                phase: {
                    slug: phaseSlug,
                    projectId: projectId
                }
            },
            include: {
                phase: { select: { name: true, slug: true } },
                items: {
                    include: {
                        catalogue: true,
                        assignedSupplier: true,
                    }
                }
            }
        });

        if (!requisition) {
            throw new ValidationError("Requisition not found in this project phase.");
        }

        const items = requisition.items.map(item => ({
            id: item.id,
            itemName: item.catalogue.name,
            category: item.catalogue.category,
            unit: item.catalogue.unit,
            quantity: Number(item.quantity),
            estimatedUnitCost: Number(item.estimatedUnitCost),
            totalEstimatedCost: Number(item.quantity) * Number(item.estimatedUnitCost),
            status: item.status,
            supplierName: item.assignedSupplier?.supplier || "No specific supplier",
            standardRate: item.assignedSupplier ? Number(item.assignedSupplier.standardRate) : null
        }));

        return {
            id: requisition.id,
            title: requisition.title,
            slug: requisition.slug,
            status: requisition.status,
            budget: Number(requisition.budget),
            createdAt: requisition.createdAt,
            phase: requisition.phase,
            items: items
        };
    },
    
    async getPendingRequisitions(
        organizationId: string,
        pageIndex: number,
        pageSize: number,
        searchQuery: string,
    ) {
        const skip = pageIndex * pageSize;
        const whereClause: any = {
            status: "PENDING_APPROVAL",
            phase: {
                project: {
                    organizationId: organizationId,
                },
            },
        };
        if (searchQuery) {
            whereClause.OR = [
                {
                    phase: {
                        name: { contains: searchQuery, mode: "insensitive" },
                    },
                },
                {
                    phase: {
                        project: {
                            name: {
                                contains: searchQuery,
                                mode: "insensitive",
                            },
                        },
                    },
                },
            ];
        }

        const [result, count] = await Promise.all([
            prisma.requisition.findMany({
                where: whereClause,
                select: {
                    id: true,
                    budget: true,
                    status: true,
                    requestedBy: true,
                    phaseId: true,
                    createdAt: true,
                    items: {
                        select: {
                            id: true,
                            quantity: true,
                            estimatedUnitCost: true,
                            assignedSupplier: {
                                select: {
                                    id: true,
                                    supplier: true,
                                    truePrice: true,
                                    standardRate: true,
                                },
                            },
                            catalogue: {
                                select: {
                                    name: true,
                                    unit: true,
                                },
                            },
                        },
                    },
                    phase: {
                        select: {
                            name: true,
                            project: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                },
                skip: skip,
                take: pageSize,
                orderBy: {
                    createdAt: "asc",
                },
            }),
            prisma.requisition.count({
                where: whereClause,
            }),
        ]);

        const engineerIds = [...new Set(result.map((req) => req.requestedBy))];

        const users = await User.find({
            _id: { $in: engineerIds },
        }).lean();

        const userMap = new Map(
            users.map((user) => [
                user._id.toString(),
                {
                    id: user._id.toString(),
                    name: user.username,
                    image: user.profileImage || null,
                },
            ]),
        );

        const data = result.map((req) => ({
            id: req.id,
            budget: Number(req.budget),
            status: req.status as "PENDING_APPROVAL",
            phaseId: req.phaseId,
            createdAt: req.createdAt,
            projectName: req.phase?.project?.name || "",
            phaseName: req.phase?.name || "",
            engineer: userMap.get(req.requestedBy) || {
                id: req.requestedBy,
                name: "Unknown User",
                image: null,
            },
            items: req.items.map((item) => ({
                id: item.id,
                quantity: Number(item.quantity),
                estimatedUnitCost: Number(item.estimatedUnitCost),
                supplierId: item.assignedSupplier?.id,
                supplierName: item.assignedSupplier?.supplier,
                truePrice: item.assignedSupplier
                    ? Number(item.assignedSupplier.truePrice)
                    : undefined,
                standardRate: item.assignedSupplier
                    ? Number(item.assignedSupplier.standardRate)
                    : undefined,
                itemName: item.catalogue?.name || "",
                unit: item.catalogue?.unit || "",
            })),
        }));
        return {
            data,
            count,
        };
    },

    async approveRequisition(requisitionId: string) {
        const requisition = await prisma.requisition.findFirst({
            where: {
                id: requisitionId,
            },
        });

        if (!requisition) {
            throw new ValidationError("Requisition not found.");
        }

        if (requisition.status !== "PENDING_APPROVAL") {
            throw new ValidationError(
                "Only pending requisitions can be approved.",
            );
        }

        await prisma.requisition.update({
            where: { id: requisitionId },
            data: { status: "APPROVED" },
        });
    },

    async rejectRequisition( requisitionId: string) {
        const requisition = await prisma.requisition.findFirst({
            where: {
                id: requisitionId,
            },
        });

        if (!requisition) {
            throw new ValidationError("Requisition not found.");
        }

        if (requisition.status !== "PENDING_APPROVAL") {
            throw new ValidationError(
                "Only pending requisitions can be rejected.",
            );
        }

        await prisma.requisition.update({
            where: { id: requisitionId },
            data: { status: "REJECTED" },
        });
    },
};

export default requisitionService;
