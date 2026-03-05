import { prisma } from "../../shared/lib/prisma";
import type { createCatalogueFormSchema } from "./catalogue.schema";

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
    },

    async createCatalogue(data: createCatalogueFormSchema, orgId: string) {
        console.log("start")
        const catalogue = await prisma.catalogue.findUnique({
            where: {
                name_organizationId: {
                    name: data.name,
                    organizationId: orgId
                }
            }
        })

        if(!catalogue) {
            console.log("create")
            return prisma.catalogue.create({
                data: {
                    name: data.name,
                    category: data.category ,
                    unit: data.unit,
                    organizationId: orgId,
                    supplierQuotes: {
                        create: {
                            supplier: data.supplier,
                            truePrice: data.truePrice,
                            standardRate: data.standardRate,
                            leadTime: data.leadTime,
                        }
                    }
                }
            })
        }
        console.log("update")
        return prisma.supplierQuote.create({
            data: {
                supplier: data.supplier,
                truePrice: data.truePrice,
                standardRate: data.standardRate,
                leadTime: data.leadTime,
                catalogueId: catalogue.id
            }
        })
    }
}

export default catalogueService;