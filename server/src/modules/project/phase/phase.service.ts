import { ValidationError } from "../../../shared/error/validation.error.js";
import { notify } from "../../../shared/lib/notify.js";
import { prisma } from "../../../shared/lib/prisma.js";

async function ensureProjectActive(projectId: string) {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { status: true },
    });

    if (!project) {
        throw new ValidationError("Project not found");
    }

    if (project.status !== "ACTIVE") {
        throw new ValidationError("Project must be ACTIVE to make changes.");
    }
}

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
        await ensureProjectActive(projectId);

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
                budget: data.budget,
                startDate: data.startDate,
                paymentDeadline: data.paymentDeadline,
                sequenceOrder: calculatedOrder,
                status: "PLANNING",
                slug: currentSlug,
                slugBase: slugBase,
                slugIndex: nextIndex,
            },
        });

        return {
            id: phase.id,
            name: phase.name,
            slug: phase.slug,
            sequenceOrder: phase.sequenceOrder,
            status: phase.status,
        };
    },

    async getProjectTimeline(projectId: string) {
        const phases = await prisma.phase.findMany({
            where: { projectId: projectId },
            orderBy: { sequenceOrder: "desc" },
            include: {
                siteLogs: {
                    orderBy: { workDate: "desc" },
                    include: {
                        author: { select: { userId: true } },
                        images: {
                            include: {
                                comments: {
                                    orderBy: { createdAt: "asc" },
                                    include: {
                                        author: { select: { userId: true } },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        const authorUserIds = new Set<string>();
        phases.forEach((phase) => {
            phase.siteLogs.forEach((log) => {
                authorUserIds.add(log.author.userId);
                log.images.forEach((img) => {
                    img.comments.forEach((c) =>
                        authorUserIds.add(c.author.userId),
                    );
                });
            });
        });

        const { User } = await import("../../../shared/models/user.js");
        const users = await User.find({
            _id: { $in: Array.from(authorUserIds) },
        }).lean();
        const userMap = new Map(users.map((u) => [u._id.toString(), u]));

        const timeline = phases.map((phase) => {
            const mappedSiteLogs = phase.siteLogs.map((log) => {
                const mongoUser = userMap.get(log.author.userId);

                const mappedImages = log.images.map((img) => ({
                    id: img.id,
                    url: img.url,
                    comments: img.comments.map((c) => {
                        const commentUser = userMap.get(c.author.userId);
                        return {
                            id: c.id,
                            text: c.text,
                            createdAt: c.createdAt,
                            author: {
                                name: commentUser
                                    ? commentUser.username
                                    : "Unknown User",
                                profile: commentUser?.profileImage || null,
                            },
                        };
                    }),
                }));

                const totalComments = mappedImages.reduce(
                    (sum, img) => sum + img.comments.length,
                    0,
                );

                return {
                    id: log.id,
                    title: log.title,
                    workDate: log.workDate,
                    description: log.description,
                    author: {
                        name: mongoUser ? mongoUser.username : "Unknown User",
                        profile: mongoUser?.profileImage || null,
                    },
                    images: mappedImages,
                    imageCount: mappedImages.length,
                    commentCount: totalComments,
                };
            });

            return {
                id: phase.id,
                name: phase.name,
                description: phase.description,
                budget: Number(phase.budget),
                status: phase.status,
                startDate: phase.startDate,
                siteLogs: mappedSiteLogs,
            };
        });

        return timeline;
    },

    async getPhases(projectId: string) {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                phases: {
                    orderBy: { sequenceOrder: "desc" },
                    include: {
                        requisitions: {
                            where: { status: "APPROVED" },
                            select: { budget: true },
                        },
                        siteLogs: {
                            orderBy: { workDate: "desc" },
                            take: 2,
                            include: {
                                author: { select: { userId: true } },
                            },
                        },
                        _count: {
                            select: { siteLogs: true },
                        },
                    },
                },
            },
        });
        if (!project) {
            throw new ValidationError("Project not found");
        }

        const phaseIds = project.phases.map((p) => p.id);
        const commentsData = await prisma.phase.findMany({
            where: { id: { in: phaseIds } },
            select: {
                id: true,
                siteLogs: {
                    select: {
                        images: {
                            select: { _count: { select: { comments: true } } },
                        },
                    },
                },
            },
        });

        const commentCountMap = new Map();
        commentsData.forEach((p) => {
            const total = p.siteLogs.reduce((acc, log) => {
                return (
                    acc +
                    log.images.reduce(
                        (imgAcc, img) => imgAcc + img._count.comments,
                        0,
                    )
                );
            }, 0);
            commentCountMap.set(p.id, total);
        });

        // Resolve MongoDB Users for the site log authors
        const authorUserIds = new Set<string>();
        project.phases.forEach((phase) => {
            phase.siteLogs.forEach((log) =>
                authorUserIds.add(log.author.userId),
            );
        });

        const { User } = await import("../../../shared/models/user.js");
        const users = await User.find({
            _id: { $in: Array.from(authorUserIds) },
        }).lean();
        const userMap = new Map(users.map((u) => [u._id.toString(), u]));

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

            const mappedLogs = phase.siteLogs.map((log) => {
                const mongoUser = userMap.get(log.author.userId);
                return {
                    id: log.id,
                    title: log.title,
                    workDate: log.workDate,
                    authorName: mongoUser ? mongoUser.username : "Unknown User",
                };
            });

            return {
                id: phase.id,
                name: phase.name,
                slug: phase.slug,
                status: phase.status,
                startDate: phase.startDate,
                description: phase.description,
                sequenceOrder: Number(phase.sequenceOrder),
                budget: Number(phase.budget),
                spent: phaseSpent,
                totalLogs: phase._count.siteLogs,
                totalComments: commentCountMap.get(phase.id) || 0,
                latestActivity: mappedLogs,
            };
        });

        const overallProgress =
            totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

        const val = {
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
        return val;
    },

    async getPhaseDetails(projectId: string, phaseId: string) {
        const phase = await prisma.phase.findUnique({
            where: { id: phaseId, projectId: projectId },
            include: {
                requisitions: {
                    where: { status: "APPROVED" },
                    select: { budget: true },
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

        const spent = phase.requisitions.reduce(
            (sum, req) => sum + Number(req.budget),
            0,
        );

        const isOverdue = phase.paymentDeadline < new Date() && !phase.isPaid;

        const authorUserIds = [
            ...new Set(phase.siteLogs.map((log) => log.author.userId)),
        ];

        const { User } = await import("../../../shared/models/user.js");
        const users = await User.find({ _id: { $in: authorUserIds } }).lean();
        const userMap = new Map(users.map((u) => [u._id.toString(), u]));

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
            siteLogs: mappedSiteLogs,
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
                // Fetch Requisitions and their nested Items to calculate spend
                requisitions: {
                    include: {
                        items: {
                            where: { status: "ORDERED" },
                            select: {
                                quantity: true,
                                estimatedUnitCost: true,
                            },
                        },
                    },
                },
                siteLogs: {
                    orderBy: { workDate: "desc" },
                    include: {
                        author: { select: { userId: true } },
                        images: true,
                        comments: {
                            orderBy: { createdAt: "asc" },
                            include: {
                                author: { select: { userId: true } },
                            },
                        },
                    },
                },
            },
        });

        if (!phase) {
            throw new ValidationError("Phase not found");
        }

        // 1. Calculate Financials based on ORDERED items
        let spent = 0;
        phase.requisitions.forEach((req) => {
            req.items.forEach((item) => {
                const quantity = Number(item.quantity);
                const unitCost = Number(item.estimatedUnitCost);
                spent += quantity * unitCost;
            });
        });

        const budget = Number(phase.budget);
        const remaining = budget - spent;

        // 2. Resolve MongoDB Users (Unchanged)
        const authorUserIds = new Set<string>();
        phase.siteLogs.forEach((log) => {
            authorUserIds.add(log.author.userId);
            log.comments.forEach((c) => authorUserIds.add(c.author.userId));
        });

        const { User } = await import("../../../shared/models/user.js");
        const users = await User.find({
            _id: { $in: Array.from(authorUserIds) },
        }).lean();
        const userMap = new Map(users.map((u) => [u._id.toString(), u]));

        // 3. Format Output (Unchanged)
        const mappedSiteLogs = phase.siteLogs.map((log) => {
            const logAuthor = userMap.get(log.author.userId);
            return {
                id: log.id,
                title: log.title,
                description: log.description,
                workDate: log.workDate,
                author: {
                    name: logAuthor ? logAuthor.username : "Unknown User",
                    profile: logAuthor?.profileImage || null,
                },
                images: log.images.map((img) => ({
                    id: img.id,
                    url: img.url,
                })),
                comments: log.comments.map((comment) => {
                    const commentAuthor = userMap.get(comment.author.userId);
                    return {
                        id: comment.id,
                        text: comment.text,
                        createdAt: comment.createdAt,
                        imageId: comment.imageId,
                        author: {
                            name: commentAuthor
                                ? commentAuthor.username
                                : "Unknown",
                            profile: commentAuthor?.profileImage || null,
                        },
                    };
                }),
            };
        });

        return {
            id: phase.id,
            slug: phase.slug,
            name: phase.name,
            sequenceOrder: Number(phase.sequenceOrder),
            status: phase.status,
            startDate: phase.startDate,
            financials: {
                budget,
                spent,
                remaining,
            },
            siteLogs: mappedSiteLogs,
        };
    },

    async updatePhase(
        projectId: string,
        phaseSlug: string, // 👇 Changed to phaseSlug
        data: {
            name?: string | undefined;
            description?: string | undefined;
            startDate?: Date | undefined;
            budget?: number | undefined;
            paymentDeadline?: Date | undefined;
        },
    ) {
        await ensureProjectActive(projectId);

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
            where: { id: phase.id },
            data: updatePayload,
        });

        return {
            id: updatedPhase.id,
            slug: updatedPhase.slug,
            name: updatedPhase.name,
            status: updatedPhase.status,
            budget: Number(updatedPhase.budget),
        };
    },

    async deletePhase(projectId: string, phaseId: string) {
        await ensureProjectActive(projectId);

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
        await ensureProjectActive(projectId);

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
        await ensureProjectActive(projectId);

        const phase = await prisma.phase.findUnique({
            where: { id: phaseId, projectId },
            include: { project: { include: { organization: true } } }, // <-- Need slugs for actionUrl
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

        // SEND NOTIFICATION
        await notify({
            type: "PHASE_STATUS_CHANGED",
            title: "Phase is now Active",
            body: `Payment received for ${phase.name}. Engineers can now begin site logs and material orders.`,
            entityType: "PHASE",
            entityId: phase.id,
            projectId: phase.projectId,
            orgId: phase.project.organizationId,
            actionUrl: `/${phase.project.organization.slug}/${phase.project.slug}/progress/${phase.slug}`,
        });
    },

    async completePhase(projectId: string, phaseId: string) {
        await ensureProjectActive(projectId);

        const phase = await prisma.phase.findUnique({
            where: { id: phaseId, projectId },
            include: { project: { include: { organization: true } } }, // <-- Need slugs for actionUrl
        });

        if (!phase) throw new ValidationError("Phase not found");
        if (phase.status !== "ACTIVE") {
            throw new ValidationError(
                "Only an ACTIVE phase can be marked as completed.",
            );
        }

        const pendingRequisition = await prisma.requisition.findFirst({
            where: { phaseId: phaseId, status: "PENDING_APPROVAL" },
        });
        if (pendingRequisition) {
            throw new ValidationError(
                "Cannot complete phase: There are material requisitions awaiting admin approval.",
            );
        }

        const unorderedItem = await prisma.requisitionItem.findFirst({
            where: { requisition: { phaseId: phaseId }, status: "UNORDERED" },
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

        // SEND NOTIFICATION
        await notify({
            type: "PHASE_STATUS_CHANGED",
            title: "Phase Completed",
            body: `Milestone Achieved: ${phase.name} has been officially completed!`,
            entityType: "PHASE",
            entityId: phase.id,
            projectId: phase.projectId,
            orgId: phase.project.organizationId,
            actionUrl: `/${phase.project.organization.slug}/${phase.project.slug}/progress/${phase.slug}`,
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
};

export default phaseService;
