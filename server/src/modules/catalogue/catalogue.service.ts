import { prisma } from "../../shared/lib/prisma";

const catalogueService = {
    async getCatalogue(orgId: string) {
        const data = await prisma.catalogue.findMany({
            where: {
                organizationId: orgId
            },
            include: {
                supplierQuotes: true
            },
            orderBy: {
                name: "asc"
            }
        })
        return data;
    }
}

export default catalogueService;