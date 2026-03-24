import { prisma } from "../../shared/lib/prisma.js";
import { User } from "../../shared/models/user.js";

const engineerService = {
    async getEngineers(
        organizationId: string,
        pageIndex: number,
        pageSize: number,
        searchQuery: string,
    ) {
        const skip = pageIndex * pageSize;

        const pendingMemberships = await prisma.membership.findMany({
            where: {
                organizationId: organizationId,
                role: "ENGINEER",
            },
            select: {
                userId: true,
                role: true,
            },
        });

        const userIds = pendingMemberships.map((m) => m.userId);

        if (userIds.length === 0) {
            return { data: [], totalCount: 0, totalPages: 0 };
        }

        const mongoQuery: any = {
            _id: { $in: userIds },
        };

        if (searchQuery) {
            mongoQuery.username = { $regex: searchQuery, $options: "i" };
        }

        const [users, totalCount] = await Promise.all([
            User.find(mongoQuery)
                .skip(skip)
                .limit(pageSize)
                .select("username email profileImage")
                .lean(),
            User.countDocuments(mongoQuery),
        ]);

        const data = users.map((user) => {
            const membership = pendingMemberships.find(
                (m) => m.userId === user._id.toString(),
            );

            return {
                id: user._id.toString(),
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
                role: membership?.role || "ENGINEER",
            };
        });

        return {
            data,
            totalCount,
            totalPages: Math.ceil(totalCount / pageSize),
        };
    },
};

export default engineerService;
