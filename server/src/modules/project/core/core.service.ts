import { prisma } from "../../../shared/lib/prisma.js";
import { slugify } from "../../../shared/utils/slugify.js";
import { User } from "../../../shared/models/user.js";
import { Types } from "mongoose";
import crypto from "node:crypto";
import { sendInviteEmail } from "../../../shared/lib/emails/sendClientInvitation.js"; 
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
        const whereClause: any = { organizationId };

        if (role !== "ADMIN") {
            whereClause.assignments = { some: { userId } };
        }

        if (searchQuery) {
            whereClause.OR = [
                { name: { contains: searchQuery, mode: "insensitive" } },
                { slug: { contains: searchQuery, mode: "insensitive" } },
            ];
        }

        const [projects, count] = await Promise.all([
            prisma.project.findMany({
                where: whereClause,
                include: {
                    phases: true,
                    _count: { select: { assignments: true } },
                },
                take: pageSize,
                skip: skip,
            }),
            prisma.project.count({ where: whereClause }),
        ]);

        return {
            data: projects.map((p) => ({
                id: p.id,
                name: p.name,
                slug: p.slug,
                estimatedBudget: Number(p.estimatedBudget),
                phases: p.phases.length,
                assignments: p._count.assignments,
            })),
            count,
        };
    },

    async getProjectDetails(projectId: string) {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                phases: {
                    select: { id: true, name: true, status: true },
                    orderBy: { sequenceOrder: "asc" },
                },
            },
        });

        if (!project) throw new Error("Project not found");

        // Site Logs are now tied to Project directly
        const recentLogs = await prisma.siteLog.findMany({
            where: { projectId },
            orderBy: { workDate: "desc" },
            take: 5,
            include: { author: { select: { userId: true } } },
        });

        const authorUserIds = [...new Set(recentLogs.map((log) => log.author.userId))];
        const users = await User.find({ _id: { $in: authorUserIds } }).lean();
        const userMap = new Map(users.map((u) => [u._id.toString(), u]));

        // Calculate Consumption across all PhaseLineItems
        const totalConsumed = await prisma.requisitionItem.aggregate({
            where: {
                status: "ORDERED",
                requisition: { phase: { projectId } }
            },
            _sum: { actualUnitCost: true, quantity: true }
        });

        // We calculate sum manually for precision since we have many items
        const items = await prisma.requisitionItem.findMany({
             where: { status: "ORDERED", requisition: { phase: { projectId } } },
             select: { actualUnitCost: true, quantity: true }
        });
        
        const consumedBudget = items.reduce((acc, curr) => 
            acc + (Number(curr.actualUnitCost || 0) * Number(curr.quantity)), 0
        );

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
            phases: project.phases,
            recentSiteLogs: recentLogs.map((log) => ({
                id: log.id,
                title: log.title,
                workDate: log.workDate,
                authorName: userMap.get(log.author.userId)?.username || "Unknown",
            })),
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

        const allUserIds = [...new Set([...adminMembers.map((m) => m.userId), ...projectAssignments.map((m) => m.userId)])];
        const usersDoc = await User.find({ _id: { $in: allUserIds.map((id) => new Types.ObjectId(id)) } }).lean();
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

        return {
            admin: { members: adminMembers.map(m => formatUser(m.userId, "ADMIN")), count: adminMembers.length },
            engineers: { members: projectAssignments.filter(a => a.role === "ENGINEER").map(a => formatUser(a.userId, "ENGINEER")), count: projectAssignments.filter(a => a.role === "ENGINEER").length },
            clients: { members: projectAssignments.filter(a => a.role === "CLIENT").map(a => formatUser(a.userId, "CLIENT")), count: projectAssignments.filter(a => a.role === "CLIENT").length },
        };
    },

    async assignMember(projectId: string, organizationId: string, userId: string, role: "ENGINEER" | "CLIENT") {
        const orgMember = await prisma.membership.findUnique({
            where: { userId_organizationId: { userId, organizationId } },
        });
        if (!orgMember) throw new ValidationError("User must be in Org first.");
        await prisma.assignment.upsert({
            where: { userId_projectId: { userId, projectId } },
            update: { role },
            create: { userId, projectId, role },
        });
    },

    async removeMember(projectId: string, userId: string) {
        await prisma.assignment.delete({ where: { userId_projectId: { userId, projectId } } }).catch(() => {});
    },

    async createInvite(organizationId: string, projectId: string, email: string, role: "ENGINEER" | "CLIENT") {
        const existingInvite = await prisma.invitation.findFirst({
            where: { email, organizationId, status: "PENDING", projects: { some: { projectId } } },
        });
        if (existingInvite) {
            await sendInviteEmail(email, existingInvite.token);
            return;
        }
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 604800000);
        await prisma.invitation.create({
            data: { email, token, role, organizationId, expiresAt, projects: { create: { projectId } } },
        });
        await sendInviteEmail(email, token);
    },
};

export default coreService;