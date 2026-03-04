import { prisma } from "../../shared/lib/prisma";

const catalogueService = {
    async getCatalogue(orgId: string) {
        const data = prisma.catalogue.findMany({
            where: {
                organizationId: orgId
            },
            include: {
                supplierQuotes: true
            }
        })
        return data;
    }
}

export default catalogueService;