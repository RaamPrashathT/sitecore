import { ValidationError } from "../../../shared/error/validation.error.js";
import { notify } from "../../../shared/lib/notify.js";
import { prisma } from "../../../shared/lib/prisma.js";

const sitelogService = {
    async createSiteLog(
        projectId: string,
        userId: string,
        data: {
            title: string;
            description?: string | undefined;
            isDelayEvent: boolean;
            delayReason?: string | undefined;
            weatherConditions?: string | undefined;
            workDate: Date;
            images: string[];
            progressUpdates: Array<{ lineItemId: string; percentageChange: number }>;
        },
    ) {
        // Find membership directly via project's organization
        const membership = await prisma.membership.findFirst({
            where: {
                userId: userId,
                organization: {
                    projects: { some: { id: projectId } }
                }
            },
            include: { organization: true }
        });

        if (!membership) {
            throw new ValidationError("User is not a member of this organization.");
        }

        const project = await prisma.project.findUnique({
            where: { id: projectId }
        });

        const siteLog = await prisma.siteLog.create({
            data: {
                projectId: projectId,
                authorId: membership.id,
                title: data.title,
                description: data.description ?? null,
                isDelayEvent: data.isDelayEvent,
                delayReason: data.delayReason ?? null,
                weatherConditions: data.weatherConditions ?? null,
                workDate: data.workDate,
                images: {
                    create: data.images.map((url) => ({
                        url,
                        uploaderId: membership.id,
                    })),
                },
                progressUpdates: {
                    create: data.progressUpdates.map((update) => ({
                        lineItemId: update.lineItemId,
                        percentageChange: update.percentageChange
                    }))
                }
            },
            include: { progressUpdates: true }
        });

        // The Engine: Update the master completion percentage on the Line Items
        // This ensures the Draw Request math is always ready to go.
        for (const update of data.progressUpdates) {
            await prisma.phaseLineItem.update({
                where: { id: update.lineItemId },
                data: {
                    percentageComplete: {
                        increment: update.percentageChange
                    }
                }
            });
        }

        await notify({
            type: "SITE_LOG_CREATED",
            title: "New Site Log Added",
            body: `${data.title} was just added to ${project?.name}.`,
            entityType: "SITE_LOG",
            entityId: siteLog.id,
            projectId: projectId,
            orgId: membership.organizationId,
            actionUrl: `/${membership.organization.slug}/${project?.slug}/timeline`,
        });

        return siteLog;
    },

    async createComment(
        projectId: string,
        sitelogId: string,
        userId: string,
        data: {
            text: string;
            imageId?: string | null | undefined;
        },
    ) {
        const siteLog = await prisma.siteLog.findUnique({
            where: { id: sitelogId },
            include: { project: { include: { organization: true } } },
        });

        if (!siteLog || siteLog.projectId !== projectId) {
            throw new ValidationError("Site log not found.");
        }

        const membership = await prisma.membership.findFirst({
            where: {
                userId: userId,
                organizationId: siteLog.project.organizationId,
            },
        });

        if (!membership) {
            throw new ValidationError("User is not a member of this organization.");
        }

        const comment = await prisma.comment.create({
            data: {
                text: data.text,
                imageId: data.imageId || null,
                sitelogId: siteLog.id,
                authorId: membership.id,
            },
        });

        await notify({
            type: "SITE_LOG_CREATED",
            title: "New Comment on Site Log",
            body: `Someone commented on the site log: "${siteLog.title}".`,
            entityType: "SITE_LOG",
            entityId: siteLog.id,
            projectId: siteLog.projectId,
            orgId: siteLog.project.organizationId,
            actionUrl: `/${siteLog.project.organization.slug}/${siteLog.project.slug}/timeline`,
        });

        return {
            id: comment.id,
            text: comment.text,
            imageId: comment.imageId,
            createdAt: comment.createdAt,
        };
    },

    async deleteComment(projectId: string, commentId: string, userId: string) {
        const comment = await prisma.comment.findFirst({
            where: { id: commentId },
            include: {
                image: { include: { siteLog: true } },
                sitelog: true, // In case it's a log-level comment, not an image-level comment
                author: true,
            },
        });

        const targetProjectId = comment?.image?.siteLog.projectId || comment?.sitelog?.projectId;

        if (!comment || targetProjectId !== projectId) {
            throw new ValidationError("Comment not found.");
        }

        const assignment = await prisma.assignment.findFirst({
            where: {
                projectId: projectId,
                userId: userId,
            },
        });

        const isAdmin = assignment?.role === "ADMIN";
        const isAuthor = comment.author.userId === userId;

        if (!isAuthor && !isAdmin) {
            throw new ValidationError("You do not have permission to delete this comment.");
        }

        await prisma.comment.delete({
            where: { id: commentId },
        });
    },
};

export default sitelogService;