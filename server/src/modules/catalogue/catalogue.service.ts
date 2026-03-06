import { MissingError } from "../../shared/error/missing.error";
import { prisma } from "../../shared/lib/prisma";
import type { createCatalogueFormSchema, editCatalogueFormSchema } from "./catalogue.schema";

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
        const catalogue = await prisma.catalogue.findUnique({
            where: {
                name_organizationId: {
                    name: data.name,
                    organizationId: orgId
                }
            }
        })

        if(!catalogue) {
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
        return prisma.supplierQuote.create({
            data: {
                supplier: data.supplier,
                truePrice: data.truePrice,
                standardRate: data.standardRate,
                leadTime: data.leadTime,
                catalogueId: catalogue.id
            }
        })
    },

    async editCatalogue(data: editCatalogueFormSchema, orgId: string) {
        const existingCatalogue = await prisma.catalogue.findFirst({
            where: {
                id: data.catalogueId,
            },
            include: {
                supplierQuotes: true
            }  
        })

        if(!existingCatalogue) {
            throw new MissingError("Catalogue not found")
        }

        if(data.name === existingCatalogue.name) {
            await prisma.supplierQuote.update({
                where: {
                    id: data.quoteId
                },
                data: {
                    truePrice: data.truePrice,
                    supplier: data.supplier,
                    standardRate: data.standardRate,
                    leadTime: data.leadTime
                }
            })
            
        } else {
            if(existingCatalogue.supplierQuotes.length >= 2) {
                await prisma.supplierQuote.delete({
                    where: {
                        id: data.quoteId
                    }
                })
            } else {
                await prisma.catalogue.delete({
                    where: {
                        id: data.catalogueId
                    }
                })
            }

            const catalogue = await prisma.catalogue.findUnique({
                where: {
                    name_organizationId: {
                        name: data.name,
                        organizationId: orgId
                    }         
                }
            })
            if(catalogue) {
                await prisma.supplierQuote.create({
                    data: {
                        truePrice: data.truePrice,
                        supplier: data.supplier,
                        standardRate: data.standardRate,
                        leadTime: data.leadTime,
                        catalogueId: catalogue.id
                    }
                })
            } else {
                await prisma.catalogue.create({
                    data: {
                        name: data.name,
                        category: data.category,
                        unit: data.unit,
                        organizationId: orgId,
                        supplierQuotes: {
                            create: {
                                truePrice: data.truePrice,
                                supplier: data.supplier,
                                standardRate: data.standardRate,
                                leadTime: data.leadTime
                            }
                        }
                    }
                })
            }
        }
    }
}

export default catalogueService;