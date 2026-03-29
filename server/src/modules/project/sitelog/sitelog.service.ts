import { ValidationError } from "../../../shared/error/validation.error.js";
import { prisma } from "../../../shared/lib/prisma.js";

const sitelogService = {
    async createSiteLog(
        projectId: string,
        phaseId: string,
        userId: string, 
        data: {
            title: string;
            description?: string | undefined;
            workDate: Date;
            images: string[];
        }
    ) {
        const phase = await prisma.phase.findUnique({
            where: { id: phaseId, projectId: projectId },
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
                phaseId: phaseId,
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
        imageId: string,
        userId: string,
        text: string
    ) {
        const image = await prisma.image.findFirst({
            where: {
                id: imageId,
                siteLog: {
                    phase: { projectId: projectId }
                }
            },
            include: {
                siteLog: {
                    include: {
                        phase: {
                            include: { project: true }
                        }
                    }
                }
            }
        });

        if (!image) {
            throw new ValidationError("Image not found in this project.");
        }

        const membership = await prisma.membership.findFirst({
            where: { 
                userId: userId, 
                organizationId: image.siteLog.phase.project.organizationId 
            }
        });

        if (!membership) {
            throw new ValidationError("User is not a member of this organization.");
        }

        const comment = await prisma.comment.create({
            data: {
                imageId: imageId,
                authorId: membership.id,
                text: text
            }
        });

        return {
            id: comment.id,
            text: comment.text,
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

        if (!comment || comment.image.siteLog.phase.projectId !== projectId) {
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