import { prisma } from "./prisma.js";
import redis from "./redis.js";

export async function syncSessionTenants(userId: string, sessionId: string) {
    const memberships = await prisma.membership.findMany({
        where: { userId },
        select: {
            role: true,
            organization: {
                select: { id: true, slug: true },
            },
        },
    });

    const formattedTenant = memberships.reduce((acc, item) => {
        acc[item.organization.slug] = {
            id: item.organization.id,
            role: item.role,
        };
        return acc;
    }, {} as Record<string, { id: string; role: string }>);

    const rawSession = await redis.get(`session:${sessionId}`);
    if (!rawSession) return;

    const sessionData = JSON.parse(rawSession);

    sessionData.tenant = formattedTenant;
    
    await redis.set(`session:${sessionId}`, JSON.stringify(sessionData), { KEEPTTL: true });

    return formattedTenant;
}