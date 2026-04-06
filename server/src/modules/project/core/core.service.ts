import { prisma } from "../../../shared/lib/prisma.js";
import { slugify } from "../../../shared/utils/slugify.js";
import { User } from "../../../shared/models/user.js"; // Adjust path to Mongo User model
import { Types } from "mongoose";
import crypto from "node:crypto";
import { sendInviteEmail } from "../../../shared/lib/emails/sendClientInvitation.js"; // Adjust path if needed
import { ValidationError } from "../../../shared/error/validation.error.js";

const coreService = {
    async createProject({
        organizationId,
        projectName,
        address,
        estimatedBudget,
    }: {
        readonly organizationId: string;
        readonly projectName: string;
        readonly address: string;
        readonly estimatedBudget: number;
    }) {
        const slugBase = slugify(projectName);
        const lastProject = await prisma.project.findFirst({
            where: { slugBase: slugBase },
            orderBy: { slugIndex: "desc" },
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
                status: "ACTIVE",
            },
        });

        return { id: result.id, name: result.name, slug: result.slug };
    },

    async getProjects(
        organizationId: string,
        pageIndex: number,
        pageSize: number,
        searchQuery: string | undefined,
        userId: string,
        role: string,
    ) {
        const skip = pageIndex * pageSize;
        const whereClause: any = {
            organizationId: organizationId,
        };

        // Filter to only assigned projects if not ADMIN
        if (role !== "ADMIN") {
            whereClause.assignments = {
                some: {
                    userId: userId,
                },
            };
        }

        if (searchQuery) {
            whereClause.OR = [
                {
                    name: {
                        contains: searchQuery,
                        mode: "insensitive",
                    },
                },
                {
                    slug: {
                        contains: searchQuery,
                        mode: "insensitive",
                    },
                },
            ];
        }

        const [projects, count] = await Promise.all([
            prisma.project.findMany({
                where: whereClause,
                include: {
                    phases: true, // Just include them so we can count them
                    _count: {
                        select: { assignments: true },
                    },
                },
                take: pageSize,
                skip: skip,
            }),
            prisma.project.count({
                where: whereClause,
            }),
        ]);

        const data = projects.map((project) => {
            return {
                id: project.id,
                name: project.name,
                slug: project.slug,
                estimatedBudget: Number(project.estimatedBudget),
                phases: project.phases.length,
                assignments: project._count.assignments,
            };
        });

        return {
            data,
            count,
        };
    },

    async getProjectDetails(projectId: string) {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                phases: {
                    select: {
                        id: true,
                        name: true,
                        status: true,
                        budget: true,
                        // NEW: Fetch all ordered items to calculate actual consumed budget
                        requisitions: {
                            select: {
                                items: {
                                    where: { status: "ORDERED" },
                                    select: {
                                        quantity: true,
                                        estimatedUnitCost: true,
                                        assignedSupplier: {
                                            select: { truePrice: true },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    orderBy: { sequenceOrder: "asc" },
                },
            },
        });

        if (!project) throw new Error("Project not found");

        // Fetch recent site logs across all phases of this project
        const recentLogs = await prisma.siteLog.findMany({
            where: { phase: { projectId: projectId } },
            orderBy: { workDate: "desc" },
            take: 5,
            include: { author: { select: { userId: true } } },
        });

        // Fetch authors for the logs
        const authorUserIds = [
            ...new Set(recentLogs.map((log) => log.author.userId)),
        ];
        const { User } = await import("../../../shared/models/user.js");
        const users = await User.find({ _id: { $in: authorUserIds } }).lean();
        const userMap = new Map(users.map((u) => [u._id.toString(), u]));

        const mappedLogs = recentLogs.map((log) => {
            const author = userMap.get(log.author.userId);
            return {
                id: log.id,
                title: log.title,
                workDate: log.workDate as any, // Will serialize to ISO string
                authorName: author ? author.username : "Unknown",
            };
        });

        // NEW: Calculate Consumed Budget from ORDERED items
        let consumedBudget = 0;
        project.phases.forEach((phase) => {
            phase.requisitions.forEach((req) => {
                req.items.forEach((item) => {
                    const priceToUse = item.assignedSupplier?.truePrice
                        ? Number(item.assignedSupplier.truePrice)
                        : Number(item.estimatedUnitCost);

                    consumedBudget += priceToUse * Number(item.quantity);
                });
            });
        });

        return {
            id: project.id,
            name: project.name,
            slug: project.slug,
            address: project.address,
            status: project.status,
            budgets: {
                estimatedTotal: Number(project.estimatedBudget),
                consumed: consumedBudget,
                remaining: Number(project.estimatedBudget) - consumedBudget,
            },
            // Strip out the requisitions payload to perfectly match the frontend hook interface
            phases: project.phases.map((phase) => ({
                id: phase.id,
                name: phase.name,
                status: phase.status,
            })),
            recentSiteLogs: mappedLogs,
        };
    },

    async updateProject(projectId: string, data: any) {
        const project = await prisma.project.update({
            where: { id: projectId },
            data: {
                name: data.name,
                address: data.address,
                estimatedBudget: data.estimatedBudget,
                status: data.status,
            },
        });

        return { id: project.id, name: project.name, status: project.status };
    },

    async getMembers(projectId: string, organizationId: string) {
        // Find all admins for the organization + all direct assignments for the project
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
            admin: { members: adminList, count: adminList.length },
            engineers: { members: engineerList, count: engineerList.length },
            clients: { members: clientList, count: clientList.length },
        };
    },

    async assignMember(
        projectId: string,
        organizationId: string,
        userId: string,
        role: "ENGINEER" | "CLIENT",
    ) {
        const orgMember = await prisma.membership.findUnique({
            where: {
                userId_organizationId: {
                    userId: userId,
                    organizationId: organizationId,
                },
            },
        });

        if (!orgMember) {
            throw new ValidationError(
                "User must be added to the Organization before being assigned to a Project.",
            );
        }

        await prisma.assignment.upsert({
            where: {
                userId_projectId: {
                    userId: userId,
                    projectId: projectId,
                },
            },
            update: {
                role: role,
            },
            create: {
                userId: userId,
                projectId: projectId,
                role: role,
            },
        });
    },

    async removeMember(projectId: string, userId: string) {
        await prisma.assignment
            .delete({
                where: {
                    userId_projectId: {
                        userId: userId,
                        projectId: projectId,
                    },
                },
            })
            .catch(() => {
                // Catch error silently if record doesn't exist
            });
    },

    async createInvite(
        organizationId: string,
        projectId: string,
        email: string,
        role: "ENGINEER" | "CLIENT",
    ) {
        const existingInvite = await prisma.invitation.findFirst({
            where: {
                email: email,
                organizationId: organizationId,
                status: "PENDING",
                projects: {
                    some: { projectId: projectId },
                },
            },
        });

        if (existingInvite) {
            await sendInviteEmail(email, existingInvite.token);
            return;
        }

        const token = crypto.randomBytes(32).toString("hex");
        // Expiration to 7 days (7 * 24 * 60 * 60 * 1000)
        const expiresAt = new Date(Date.now() + 604800000);

        await prisma.invitation.create({
            data: {
                email,
                token,
                role,
                organizationId,
                expiresAt,
                projects: {
                    create: {
                        projectId,
                    },
                },
            },
        });

        await sendInviteEmail(email, token);
    },
};

export default coreService;
