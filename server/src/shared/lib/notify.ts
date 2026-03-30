import { Role, type NotificationEntityType, type NotificationType } from "../../../generated/prisma";
import { prisma } from "./prisma";


interface NotifyInput {
    type: NotificationType;
    title: string;
    body?: string;
    entityType: NotificationEntityType;
    entityId: string;
    projectId?: string;
    orgId: string;
}

export async function notify(input: NotifyInput) {
    // Resolve assigned userIds for this project
    const assignedUserIds = input.projectId
        ? (
              await prisma.assignment.findMany({
                  where: { projectId: input.projectId },
                  select: { userId: true },
              })
          ).map((a) => a.userId)
        : [];

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
        select: { id: true },
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
                create: memberships.map((m) => ({ membershipId: m.id })),
            },
        },
    });

    return notification;
}
