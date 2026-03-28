import { Types } from "mongoose";
import { MissingError } from "../../shared/error/missing.error.js";
import { ValidationError } from "../../shared/error/validation.error.js";
import { prisma } from "../../shared/lib/prisma.js";
import { User } from "../../shared/models/user.js";
import { slugify } from "../../shared/utils/slugify.js";
import {
    type CreateInviteBody,
    type CreatePhaseBody,
    type RequisitionItemListBody,
} from "./project.schema.js";
import crypto from "node:crypto";
import { sendInviteEmail } from "../../shared/lib/emails/sendClientInvitation.js";


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

    async getProjects(
        organizationId: string,
        pageIndex: number,
        pageSize: number,
        searchQuery: string,
    ) {
        const skip = pageIndex * pageSize;
        const whereClause: any = {
            organizationId: organizationId,
        };
        if (searchQuery) {
            whereClause.OR = [
                { name: { contains: searchQuery, mode: "insensitive" } },
            ];
        }
        const [data, count] = await Promise.all([
            prisma.project.findMany({
                where: whereClause,
                include: {
                    assignments: true,
                    phases: true,
                },
                take: pageSize,
                skip: skip,
                orderBy: {
                    name: "asc",
                },
            }),
            prisma.project.count({
                where: whereClause,
            }),
        ]);

        const flattened = data.map((project) => ({
            id: project.id,
            name: project.name,
            slug: project.slug,
            estimatedBudget: project.estimatedBudget,
            phases: project.phases.length,
            assignments: project.assignments.length,
        }));
        return {
            data: flattened,
            count,
        };
    },

    async getProjectDetails(projectSlug: string, organizationId: string) {
        const result = await prisma.project.findUnique({
            where: {
                slug_organizationId: {
                    slug: projectSlug,
                    organizationId: organizationId,
                },
            },
        });

        return {
            id: result?.id,
            name: result?.name,
            slug: result?.slug,
            address: result?.address,
            estimatedBudget: result?.estimatedBudget,
        };
    },

    async createPhase({
        projectId,
        data,
    }: {
        readonly projectId: string;
        readonly data: CreatePhaseBody;
    }) {
        await prisma.phase.create({
            data: {
                name: data.name,
                description: data.description,
                budget: data.budget,
                paymentDeadline: data.paymentDeadline,
                projectId: projectId,
                status: "PAYMENT_PENDING",
                startDate: data.startDate,
            },
        });
    },

    async getPhases(projectId: string) {
        const result = await prisma.phase.findMany({
            where: {
                projectId: projectId,
            },
            select: {
                id: true,
                name: true,
                description: true,
                budget: true,
                isPaid: true,
                paymentDeadline: true,
                status: true,
                projectId: true,
                requisitions: {
                    where: {
                        status: "APPROVED",
                    },
                    select: {
                        id: true,
                        budget: true,
                        status: true,
                        requestedBy: true,
                        createdAt: true,
                        items: {
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
                                        standardRate: true,
                                        leadTime: true,
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
        });

        return result.map((phase) => ({
            id: phase.id,
            name: phase.name,
            description: phase.description,
            budget: Number(phase.budget),
            isPaid: phase.isPaid,
            paymentDeadline: phase.paymentDeadline,
            status: phase.status,
            projectId: phase.projectId,
            requisitions: phase.requisitions.map((req) => ({
                id: req.id,
                budget: Number(req.budget),
                status: req.status,
                requestedBy: req.requestedBy,
                createdAt: req.createdAt,
                items: req.items.map((item) => ({
                    id: item.id,
                    quantity: Number(item.quantity),
                    estimatedUnitCost: Number(item.estimatedUnitCost),

                    itemName: item.catalogue?.name,
                    unit: item.catalogue?.unit,

                    supplierName: item.assignedSupplier?.supplier,
                    standardRate: item.assignedSupplier
                        ? Number(item.assignedSupplier.standardRate)
                        : undefined,
                    leadTime: item.assignedSupplier?.leadTime ?? undefined,
                })),
            })),
        }));
    },

    async getMembers(projectId: string, organizationId: string) {
        const [adminMembers, projectAssignments] = await Promise.all([
            prisma.membership.findMany({
                where: { organizationId, role: "ADMIN" },
                select: { userId: true, role: true },
            }),
            prisma.assignment.findMany({
                where: { projectId },
                select: { userId: true, role: true },
            }),
        ]);

        const allUserIds = [
            ...new Set([
                ...adminMembers.map((m) => m.userId),
                ...projectAssignments.map((m) => m.userId),
            ]),
        ];

        const usersDoc = await User.find(
            { _id: { $in: allUserIds.map((id) => new Types.ObjectId(id)) } },
            { username: 1, profileImage: 1, phone: 1, email: 1 },
        ).lean();

        const userMap = new Map(usersDoc.map((u) => [u._id.toString(), u]));

        const formatUser = (userId: string, role: string) => {
            const detail = userMap.get(userId);
            return {
                userId,
                name: detail?.username || "",
                image: detail?.profileImage || null,
                phone: detail?.phone || "",
                email: detail?.email || "",
                role,
            };
        };

        const adminList = adminMembers.map((m) =>
            formatUser(m.userId, "ADMIN"),
        );

        const engineerList: any[] = [];
        const clientList: any[] = [];

        projectAssignments.forEach((assign) => {
            const formatted = formatUser(assign.userId, assign.role);
            if (assign.role === "ENGINEER") engineerList.push(formatted);
            if (assign.role === "CLIENT") clientList.push(formatted);
        });

        return {
            admin: {
                members: adminList,
                count: adminList.length,
            },
            engineers: {
                members: engineerList,
                count: engineerList.length,
            },
            clients: {
                members: clientList,
                count: clientList.length,
            },
        };
    },

    async createInvite(
        organizationId: string,
        projectId: string,
        data: CreateInviteBody
    ) {
        const { email, role } = data;
        const token = crypto.randomBytes(32).toString("hex");
        await prisma.invitation.create({
            data: {
                email,
                token,
                role: role,
                organizationId,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000),
                projects: {
                    create: {
                        projectId,
                    }
                },
            },
        });
        await sendInviteEmail(email, token);
    },

    async paymentApproval(phaseId: string) {
        await prisma.phase.update({
            where: {
                id: phaseId,
                status: "PAYMENT_PENDING",
            },
            data: {
                status: "ACTIVE",
            },
        });
    },

    async createRequisition({
        userId,
        phaseId,
        budget,
    }: {
        readonly userId: string;
        readonly phaseId: string;
        readonly budget: number;
    }) {
        const result = await prisma.requisition.create({
            data: {
                phaseId: phaseId,
                requestedBy: userId,
                budget: budget,
            },
        });

        return {
            id: result.id,
        };
    },

    async postRequisitionItems(data: RequisitionItemListBody) {
        const existingRequisition = await prisma.requisition.findUnique({
            where: {
                id: data.requisitionId,
            },
        });
        if (!existingRequisition) {
            throw new MissingError("Requisition not found");
        }
        if (data.totalCost > existingRequisition.budget.toNumber()) {
            throw new ValidationError("Total cost exceeds budget");
        }

        const payload = data.cartItems.map((item) => ({
            catalogueId: item.catalogueId,
            assignedSupplierId: item.supplierId,
            estimatedUnitCost: item.estimatedCost,
            quantity: item.quantity,
            requisitionId: data.requisitionId,
        }));

        const result = await prisma.requisitionItem.createMany({
            data: payload,
        });
        await prisma.requisition.update({
            where: {
                id: data.requisitionId,
            },
            data: {
                status: "PENDING_APPROVAL",
            },
        });

        return result;
    },

    async getPaymentPendingPhases(
        organizationId: string,
        pageIndex: number,
        pageSize: number,
        searchQuery: string,
    ) {
        const skip = pageIndex * pageSize;
        const whereClause: any = {
            status: "PAYMENT_PENDING",
            isPaid: false,
            project: {
                organizationId: organizationId,
            },
        };
        if (searchQuery) {
            whereClause.OR = [
                {
                    name: { contains: searchQuery, mode: "insensitive" },
                },
                {
                    project: {
                        name: { contains: searchQuery, mode: "insensitive" },
                    },
                },
            ];
        }
        const [result, count] = await Promise.all([
            prisma.phase.findMany({
                where: whereClause,
                select: {
                    id: true,
                    name: true,
                    budget: true,
                    paymentDeadline: true,

                    project: {
                        select: {
                            name: true,

                            assignments: {
                                where: {
                                    role: "CLIENT",
                                },
                                select: {
                                    userId: true,
                                },
                            },
                        },
                    },
                },
                take: pageSize,
                skip: skip,
                orderBy: {
                    paymentDeadline: "asc",
                },
            }),
            prisma.phase.count({
                where: whereClause,
            }),
        ]);
        const userIds = [
            ...new Set(
                result.flatMap((phase) =>
                    phase.project.assignments.map(
                        (assignment) => assignment.userId,
                    ),
                ),
            ),
        ];
        const clients = await User.find({
            _id: {
                $in: userIds,
            },
        });

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
                budget: phase.budget,
                paymentDeadline: phase.paymentDeadline,
                client:
                    (firstClientId ? clientMap.get(firstClientId) : null) ||
                    "Unknown Client",
            };
        });
        return {
            data,
            count,
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

    async getRequisitionDetails(requisitionId: string) {
        const result = await prisma.requisition.findUnique({
            where: {
                id: requisitionId,
            },
        });

        if (result === null) {
            throw new MissingError("Requisition not found");
        }

        return {
            id: result.id,
            budget: result.budget,
            status: result.status,
            requestedBy: result.requestedBy,
            phaseId: result.phaseId,
        };
    },

    async approveRequisition(requisitionId: string) {
        const existingRequisition = await prisma.requisition.findUnique({
            where: {
                id: requisitionId,
            },
        });

        if (!existingRequisition) {
            throw new MissingError("Requisition not found");
        }

        await prisma.requisition.update({
            where: {
                id: requisitionId,
            },
            data: {
                status: "APPROVED",
            },
        });
    },

    async rejectRequisition(requisitionId: string) {
        const existingRequisition = await prisma.requisition.findUnique({
            where: {
                id: requisitionId,
            },
        });

        if (!existingRequisition) {
            throw new MissingError("Requisition not found");
        }

        await prisma.requisition.update({
            where: {
                id: requisitionId,
            },
            data: {
                status: "REJECTED",
            },
        });
    },
};

export default projectService;
