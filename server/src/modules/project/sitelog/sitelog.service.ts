import { ValidationError } from "../../../shared/error/validation.error.js";
import { notify } from "../../../shared/lib/notify.js";
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
        },
        materialsConsumed: Array<{
            catalogueId: string;
            locationId: string;
            quantity: number;
        }> = [],
    ) {
        const phase = await prisma.phase.findUnique({
            where: {
                slug_projectId: {
                    slug: phaseSlug,
                    projectId: projectId,
                },
            },
            include: { project: { include: { organization: true } } },
        });

        if (!phase) {
            throw new ValidationError(
                "Phase not found or does not belong to this project.",
            );
        }

        if (phase.status !== "ACTIVE") {
            throw new ValidationError(
                "Site logs can only be added to an ACTIVE phase.",
            );
        }

        const membership = await prisma.membership.findFirst({
            where: {
                userId: userId,
                organizationId: phase.project.organizationId,
            },
        });

        if (!membership) {
            throw new ValidationError(
                "User is not a member of this organization.",
            );
        }

        // Pre-validate all inventory items before starting the transaction
        for (const item of materialsConsumed) {
            const inventoryItem = await prisma.inventoryItem.findUnique({
                where: {
                    locationId_catalogueId: {
                        locationId: item.locationId,
                        catalogueId: item.catalogueId,
                    },
                },
            });

            if (!inventoryItem) {
                throw new ValidationError(
                    `Inventory item not found for catalogueId ${item.catalogueId} at locationId ${item.locationId}.`,
                );
            }

            if (Number(inventoryItem.quantityOnHand) < item.quantity) {
                throw new ValidationError(
                    `Insufficient stock for catalogueId ${item.catalogueId}. Available: ${inventoryItem.quantityOnHand}, Requested: ${item.quantity}.`,
                );
            }
        }

        const siteLog = await prisma.$transaction(async (tx) => {
            // a. Create the SiteLog
            const newSiteLog = await tx.siteLog.create({
                data: {
                    phaseId: phase.id,
                    authorId: membership.id,
                    title: data.title,
                    description: data.description ?? null,
                    workDate: data.workDate,
                    images: {
                        create: data.images.map((url) => ({
                            url,
                            uploaderId: membership.id,
                        })),
                    },
                },
            });

            // b. Process each material consumption
            for (const item of materialsConsumed) {
                const inventoryItem = await tx.inventoryItem.findUnique({
                    where: {
                        locationId_catalogueId: {
                            locationId: item.locationId,
                            catalogueId: item.catalogueId,
                        },
                    },
                });

                if (!inventoryItem || Number(inventoryItem.quantityOnHand) < item.quantity) {
                    throw new ValidationError(
                        `Insufficient stock for catalogueId ${item.catalogueId}.`,
                    );
                }

                await tx.inventoryItem.update({
                    where: { id: inventoryItem.id },
                    data: {
                        quantityOnHand: {
                            decrement: item.quantity,
                        },
                    },
                });

                await tx.inventoryTransaction.create({
                    data: {
                        type: "CONSUMED",
                        quantityChange: -item.quantity,
                        inventoryItemId: inventoryItem.id,
                        recordedById: membership.id,
                        phaseId: phase.id,
                        siteLogId: newSiteLog.id,
                    },
                });
            }

            return newSiteLog;
        });

        // Send notification after transaction
        await notify({
            type: "SITE_LOG_CREATED",
            title: "New Site Log Added",
            body: `${data.title} was just added to ${phase.name}.`,
            entityType: "SITE_LOG",
            entityId: siteLog.id,
            projectId: phase.projectId,
            orgId: phase.project.organizationId,
            actionUrl: `/${phase.project.organization.slug}/${phase.project.slug}/progress/${phase.slug}`,
        });

        return siteLog;
    },

    async createComment(
        projectId: string,
        sitelogId: string,
        userId: string,
        data: {
            text: string;
            imageId?: string | null |undefined;
        },
    ) {
        // 1. Fetch the SiteLog with all nested relations to get our slugs
        const siteLog = await prisma.siteLog.findUnique({
            where: { id: sitelogId },
            include: {
                phase: {
                    include: { project: { include: { organization: true } } },
                },
            },
        });

        if (!siteLog || siteLog.phase.projectId !== projectId) {
            throw new ValidationError("Site log not found.");
        }

        const membership = await prisma.membership.findFirst({
            where: {
                userId: userId,
                organizationId: siteLog.phase.project.organizationId,
            },
        });

        if (!membership) {
            throw new ValidationError(
                "User is not a member of this organization.",
            );
        }

        const comment = await prisma.comment.create({
            data: {
                text: data.text,
                imageId: data.imageId || null,
                sitelogId: siteLog.id,
                authorId: membership.id,
            },
        });

        // 2. SEND NOTIFICATION
        await notify({
            type: "SITE_LOG_CREATED", // Reusing this enum since it's related to the site log
            title: "New Comment on Site Log",
            body: `Someone commented on the site log: "${siteLog.title}".`,
            entityType: "SITE_LOG",
            entityId: siteLog.id,
            projectId: siteLog.phase.projectId,
            orgId: siteLog.phase.project.organizationId,
            actionUrl: `/${siteLog.phase.project.organization.slug}/${siteLog.phase.project.slug}/progress/${siteLog.phase.slug}`,
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
                image: {
                    include: {
                        siteLog: {
                            include: { phase: true },
                        },
                    },
                },
                author: true,
            },
        });

        if (!comment || comment.image?.siteLog.phase.projectId !== projectId) {
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
            throw new ValidationError(
                "You do not have permission to delete this comment.",
            );
        }

        await prisma.comment.delete({
            where: { id: commentId },
        });
    },
};

export default sitelogService;
