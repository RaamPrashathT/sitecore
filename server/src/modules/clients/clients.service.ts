import { prisma } from "../../shared/lib/prisma.js"
import { User } from "../../shared/models/user.js"

const clientService = {
    async getClients(organizationId: string) {
        const user = await prisma.membership.findMany({
            where: {
                organizationId,
                role: "CLIENT"
            },
            select: {
                userId: true
            }
        })
        const clientIDs = user.map(client => client.userId)
        const clients = await User.find({
            _id: {
                $in: clientIDs
            }
        })
        return clients.map(client => {
            return {
                id: client._id,
                username: client.username,
                email: client.email,
                profileImage: client.profileImage
            }
        })
    }
}

export default clientService;