import { Role, type NotificationEntityType, type NotificationType } from "../../../generated/prisma";
import { prisma } from "./prisma";

interface NotifyInput {
    type: NotificationType;
    title: string;
    body?: string;
    entityType: NotificationEntityType;
    entityId: string;
    projectId?: string | undefined;
    orgId: string;
}

export async function notify(input: NotifyInput) {
    const assignments = input.projectId
        ? await prisma.assignment.findMany({
              where: { projectId: input.projectId },
              select: { id: true, userId: true },
          })
        : [];

    const assignedUserIds = assignments.map((a) => a.userId);
    const assignmentByUserId = Object.fromEntries(assignments.map((a) => [a.userId, a.id]));

    const memberships = await prisma.membership.findMany({
        where: {
            organizationId: input.orgId,
            OR: [
                { role: Role.ADMIN },
                {
                    role: { in: [Role.ENGINEER, Role.CLIENT] },
                    userId: { in: assignedUserIds },
                },
            ],
        },
        select: { id: true, userId: true },
    });

    const notification = await prisma.notification.create({
        data: {
            type: input.type,
            title: input.title,
            body: input.body ?? null,
            entityType: input.entityType,
            entityId: input.entityId,
            projectId: input.projectId ?? null,
            orgId: input.orgId,
            recipients: {
                create: memberships.map((m) => ({
                    membershipId: m.id,
                    assignmentId: assignmentByUserId[m.userId] ?? null,
                })),
            },
        },
    });

    return notification;
}