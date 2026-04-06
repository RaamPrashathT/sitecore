import { MissingError } from "../../shared/error/missing.error.js";
import { prisma } from "../../shared/lib/prisma.js";
import type {
    createCatalogueFormSchema,
    deleteCatalogueFormSchema,
    editCatalogueFormSchema,
} from "./catalogue.schema.js";

const catalogueService = {
    async getCatalogue(
        orgId: string,
        pageIndex: number,
        pageSize: number,
        searchQuery: string,
    ) {
        const skip = pageIndex * pageSize;
        const whereClause: any = {
            organizationId: orgId,
        };

        if (searchQuery) {
            whereClause.OR = [
                { name: { contains: searchQuery, mode: "insensitive" } },
                {
                    supplierQuotes: {
                        some: {
                            supplier: {
                                contains: searchQuery,
                                mode: "insensitive",
                            },
                        },
                    },
                },
            ];
        }

        const [data, count] = await Promise.all([
            prisma.catalogue.findMany({
                where: whereClause,
                include: {
                    supplierQuotes: true,
                },
                take: pageSize,
                skip: skip,
                orderBy: {
                    name: "asc",
                },
            }),
            prisma.catalogue.count({
                where: whereClause,
            }),
        ]);

        return { data, count };
    },

    async getCatalogueById(catalogueId: string, quoteId: string, organizationId: string) {
        const catalogue = await prisma.catalogue.findUnique({
            where: {
                id: catalogueId,
                organizationId,
                supplierQuotes: {
                    some: {
                        id: quoteId,
                    },
                }
            },
            include: {
                supplierQuotes: {
                    where: {
                        id: quoteId,
                    }
                },
            },
        });
        return catalogue;
    },

    async createCatalogue(data: createCatalogueFormSchema, orgId: string) {
        const catalogue = await prisma.catalogue.findUnique({
            where: {
                name_organizationId: {
                    name: data.name,
                    organizationId: orgId,
                },
            },
        });

        if (!catalogue) {
            return prisma.catalogue.create({
                data: {
                    name: data.name,
                    category: data.category,
                    unit: data.unit,
                    organizationId: orgId,
                    supplierQuotes: {
                        create: {
                            supplier: data.supplier,
                            email: data.email, // <-- NEW
                            truePrice: data.truePrice,
                            standardRate: data.standardRate,
                            leadTime: data.leadTime,
                            inventory: data.inventory,
                        },
                    },
                },
            });
        }
        return prisma.supplierQuote.create({
            data: {
                supplier: data.supplier,
                email: data.email, // <-- NEW
                truePrice: data.truePrice,
                standardRate: data.standardRate,
                leadTime: data.leadTime,
                inventory: data.inventory,
                catalogueId: catalogue.id,
            },
        });
    },

    async editCatalogue(data: editCatalogueFormSchema, orgId: string) {
        const existingCatalogue = await prisma.catalogue.findFirst({
            where: {
                id: data.catalogueId,
            },
            include: {
                supplierQuotes: true,
            },
        });

        if (!existingCatalogue) {
            throw new MissingError("Catalogue not found");
        }

        if (data.name === existingCatalogue.name) {
            await prisma.supplierQuote.update({
                where: {
                    id: data.quoteId,
                },
                data: {
                    truePrice: data.truePrice,
                    supplier: data.supplier,
                    email: data.email, // <-- NEW
                    standardRate: data.standardRate,
                    leadTime: data.leadTime,
                    inventory: data.inventory,
                },
            });
        } else {
            if (existingCatalogue.supplierQuotes.length >= 2) {
                await prisma.supplierQuote.delete({
                    where: {
                        id: data.quoteId,
                    },
                });
            } else {
                await prisma.catalogue.delete({
                    where: {
                        id: data.catalogueId,
                    },
                });
            }

            const catalogue = await prisma.catalogue.findUnique({
                where: {
                    name_organizationId: {
                        name: data.name,
                        organizationId: orgId,
                    },
                },
            });
            if (catalogue) {
                await prisma.supplierQuote.create({
                    data: {
                        truePrice: data.truePrice,
                        supplier: data.supplier,
                        email: data.email,
                        standardRate: data.standardRate,
                        leadTime: data.leadTime,
                        catalogueId: catalogue.id,
                        inventory: data.inventory,
                    },
                });
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
                                email: data.email, // <-- NEW
                                standardRate: data.standardRate,
                                leadTime: data.leadTime,
                                inventory: data.inventory,
                            },
                        },
                    },
                });
            }
        }
    },

    async deleteCatalogue(data: deleteCatalogueFormSchema, orgId: string) {
        const existingCatalogue = await prisma.catalogue.findFirst({
            where: {
                id: data.catalogueId,
            },
            include: {
                supplierQuotes: true,
            },
        });
        if (!existingCatalogue) {
            throw new MissingError("Catalogue not found");
        }
        if (existingCatalogue.supplierQuotes.length >= 2) {
            await prisma.supplierQuote.delete({
                where: {
                    id: data.quoteId,
                },
            });
        } else {
            await prisma.catalogue.delete({
                where: {
                    id: data.catalogueId,
                },
            });
        }
    },
};

export default catalogueService;