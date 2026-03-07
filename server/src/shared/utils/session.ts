import { MissingError } from "../error/missing.error"
import redis from "../lib/redis"

export const addOrgContext = async(sessionId: string, context: {
    orgId: string,
    slug: string,
    role: string
}) => {
    const sessionStr = await redis.get(`session:${sessionId}`)
    
    if(!sessionStr) {
        throw new MissingError("Session not found")
    }

    const sessionObj = JSON.parse(sessionStr);
    sessionObj.contexts ??= {}

    sessionObj.contexts[context.orgId] = {
        slug: context.slug,
        role: context.role
    }

    await redis.set(
        `session:${sessionId}`,
        JSON.stringify(sessionObj),
        { KEEPTTL: true}
    )
}