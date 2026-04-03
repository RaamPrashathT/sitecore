import { ValidationError } from "../../../shared/error/validation.error.js";
import { prisma } from "../../../shared/lib/prisma.js";

const sitelogService = {
    async createSiteLog(
        projectId: string,
        phaseSlug: string,
        userId: string, 
        data: {
            title: string;
            description?: string | undefined;
            workDate: Date;
            images: string[];
        }
    ) {
        const phase = await prisma.phase.findUnique({
            where: { 
                slug_projectId: {
                    slug: phaseSlug,
                    projectId: projectId
                }
            },
            include: { project: true }
        });

        if (!phase) {
            throw new ValidationError("Phase not found or does not belong to this project.");
        }

        if (phase.status !== "ACTIVE") {
            throw new ValidationError("Site logs can only be added to an ACTIVE phase.");
        }

        const membership = await prisma.membership.findFirst({
            where: { 
                userId: userId, 
                organizationId: phase.project.organizationId 
            }
        });

        if (!membership) {
            throw new ValidationError("User is not a member of this organization.");
        }

        const siteLog = await prisma.siteLog.create({
            data: {
                phaseId: phase.id,
                authorId: membership.id, 
                title: data.title,
                description: data.description || null,
                workDate: data.workDate,
                images: {
                    create: data.images.map(url => ({
                        url: url,
                        uploaderId: membership.id
                    }))
                }
            },
            include: {
                images: true
            }
        });

        return {
            id: siteLog.id,
            title: siteLog.title,
            workDate: siteLog.workDate,
            imageCount: siteLog.images.length
        };
    },

    async createComment(
        projectId: string,
        sitelogId: string,
        userId: string,
        data: { text: string; imageId?: string | null | undefined }
    ) {
        // 1. Verify SiteLog exists and belongs to this project
        const siteLog = await prisma.siteLog.findUnique({
            where: { id: sitelogId },
            include: { 
                phase: { select: { projectId: true, project: { select: { organizationId: true } } } } 
            }
        });

        if (!siteLog || siteLog.phase.projectId !== projectId) {
            throw new ValidationError("Site log not found or access denied.");
        }

        // 2. Get the user's Organization Membership
        const membership = await prisma.membership.findFirst({
            where: {
                userId: userId,
                organizationId: siteLog.phase.project.organizationId
            }
        });

        if (!membership) {
            throw new ValidationError("User is not a member of this organization.");
        }

        // 3. Safety Check: If pinning to an image, ensure the image belongs to THIS sitelog
        if (data.imageId) {
            const image = await prisma.image.findUnique({
                where: { id: data.imageId, siteLogId: sitelogId }
            });
            if (!image) {
                throw new ValidationError("The referenced image does not belong to this site log.");
            }
        }

        // 4. Create the Comment
        const comment = await prisma.comment.create({
            data: {
                text: data.text,
                imageId: data.imageId || null,
                sitelogId: sitelogId,
                authorId: membership.id
            }
        });

        return {
            id: comment.id,
            text: comment.text,
            imageId: comment.imageId,
            createdAt: comment.createdAt
        };
    },

    async deleteComment(
        projectId: string,
        commentId: string,
        userId: string
    ) {
        const comment = await prisma.comment.findFirst({
            where: { id: commentId },
            include: {
                image: {
                    include: {
                        siteLog: {
                            include: { phase: true }
                        }
                    }
                },
                author: true
            }
        });

        if (!comment || comment.image?.siteLog.phase.projectId !== projectId) {
            throw new ValidationError("Comment not found.");
        }

        const assignment = await prisma.assignment.findFirst({
            where: {
                projectId: projectId,
                userId: userId
            }
        });

        const isAdmin = assignment?.role === "ADMIN";
        const isAuthor = comment.author.userId === userId;

        if (!isAuthor && !isAdmin) {
            throw new ValidationError("You do not have permission to delete this comment.");
        }

        await prisma.comment.delete({
            where: { id: commentId }
        });
    }
};

export default sitelogService;