import { profile } from "node:console";
import { MissingError } from "../../shared/error/missing.error";
import { prisma } from "../../shared/lib/prisma";
import { User } from "../../shared/models/user";

const engineerService = {
    async getEngineers(organizationId: string) {
        const user = await prisma.membership.findMany({
            where: {
                organizationId
            },
            select: {
                userId: true
            }
        })
        const engineerIDs = user.map(engineer => engineer.userId)
        const engineers = await User.find({
            _id: {
                $in: engineerIDs
            }
        })
        return engineers.map(engineer => {
            return {
                id: engineer._id,
                username: engineer.username,
                email: engineer.email,
                profileImage: engineer.profileImage
            }
        })
    }
}

export default engineerService;