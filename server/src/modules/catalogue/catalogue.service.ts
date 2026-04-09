import { prisma } from "../../shared/lib/prisma.js";
import type {
    CreateCataloguePayload,
    UpdateCataloguePayload,
    CreateQuotePayload,
    UpdateQuotePayload,
} from "./catalogue.schema.js";
import { User } from "../../shared/models/user.js";
import { ValidationError } from "../../shared/error/validation.error.js";

export const catalogueService = {
    async getCatalogue(
        orgId: string,
        pageIndex: number,
        pageSize: number,
        searchQuery: string,
    ) {
        const skip = pageIndex * pageSize;
        const whereClause: any = { organizationId: orgId };

        if (searchQuery) {
            whereClause.OR = [
                { name: { contains: searchQuery, mode: "insensitive" } },
                {
                    supplierQuotes: {
                        some: {
                            supplier: {
                                name: {
                                    contains: searchQuery,
                                    mode: "insensitive",
                                },
                            },
                        },
                    },
                },
            ];
        }

        const [rawItems, totalCount] = await prisma.$transaction([
            prisma.catalogue.findMany({
                where: whereClause,
                include: {
                    supplierQuotes: {
                        where: { validUntil: null },
                        include: {
                            supplier: { select: { id: true, name: true } },
                        },
                    },
                    inventoryItems: {
                        where: { quantityOnHand: { gt: 0 } },
                        include: {
                            location: {
                                select: { id: true, name: true, type: true },
                            },
                        },
                    },
                },
                take: pageSize,
                skip: skip,
                orderBy: { createdAt: "desc" },
            }),
            prisma.catalogue.count({ where: whereClause }),
        ]);

        const userIdsToFetch = Array.from(
            new Set(rawItems.map((item) => item.createdBy)),
        );
        const fetchedMongoUsers = await User.find({
            _id: { $in: userIdsToFetch },
        })
            .select("_id username profileImage")
            .lean();

        const userMap = fetchedMongoUsers.reduce((acc: any, user: any) => {
            acc[user._id.toString()] = {
                username: user.username,
                profileImage: user.profileImage,
            };
            return acc;
        }, {});

        const stitchedData = rawItems.map((item) => ({
            ...item,
            creator: userMap[item.createdBy] || {
                username: "Unknown User",
                profileImage: null,
            },
        }));

        return {
            data: stitchedData,
            meta: {
                total: totalCount,
                pageIndex,
                pageSize,
                totalPages: Math.ceil(totalCount / pageSize),
            },
        };
    },

    async getCatalogueById(orgId: string, catalogueId: string) {
        const rawItem = await prisma.catalogue.findFirstOrThrow({
            where: {
                id: catalogueId,
                organizationId: orgId,
            },
            include: {
                supplierQuotes: {
                    include: { supplier: { select: { id: true, name: true } } },
                    orderBy: { createdAt: "desc" },
                },
                inventoryItems: {
                    include: {
                        location: {
                            select: { id: true, name: true, type: true },
                        },
                    },
                },
            },
        });

        const userIdsToFetch = Array.from(new Set([rawItem.createdBy]));
        const fetchedMongoUsers = await User.find({
            _id: { $in: userIdsToFetch },
        })
            .select("_id username profileImage")
            .lean();

        const userMap = fetchedMongoUsers.reduce((acc: any, user: any) => {
            acc[user._id.toString()] = {
                username: user.username,
                profileImage: user.profileImage,
            };
            return acc;
        }, {});

        return {
            ...rawItem,
            creator: userMap[rawItem.createdBy] || {
                username: "Unknown User",
                profileImage: null,
            },
        };
    },

    async createCatalogue(
        orgId: string,
        userId: string,
        payload: CreateCataloguePayload,
    ) {
        return await prisma.$transaction(async (tx) => {
            let resolvedSupplierId = payload.supplier.id;
            if (!resolvedSupplierId && payload.supplier.name) {
                const newSupplier = await tx.supplier.create({
                    data: {
                        organizationId: orgId,
                        name: payload.supplier.name,
                    },
                });
                resolvedSupplierId = newSupplier.id;
            }

            if (!resolvedSupplierId)
                throw new Error("Supplier resolution failed");

            let resolvedLocationId = payload.inventory?.locationId;
            if (
                payload.inventory &&
                !resolvedLocationId &&
                payload.inventory.locationName
            ) {
                const newLocation = await tx.inventoryLocation.create({
                    data: {
                        organizationId: orgId,
                        name: payload.inventory.locationName,
                        type: payload.inventory.locationType as string,
                    },
                });
                resolvedLocationId = newLocation.id;
            }

            return await tx.catalogue.create({
                data: {
                    organizationId: orgId,
                    createdBy: userId,
                    name: payload.name,
                    category: payload.category,
                    unit: payload.unit,
                    defaultLeadTime: payload.defaultLeadTime || 0,
                    supplierQuotes: {
                        create: {
                            supplierId: resolvedSupplierId,
                            truePrice: payload.supplier.truePrice,
                            standardRate: payload.supplier.standardRate,
                            leadTimeDays: payload.supplier.leadTimeDays ?? null,
                        },
                    },
                    ...(payload.inventory && resolvedLocationId
                        ? {
                              inventoryItems: {
                                  create: {
                                      locationId: resolvedLocationId,
                                      quantityOnHand:
                                          payload.inventory.quantityOnHand,
                                      averageUnitCost:
                                          payload.inventory.averageUnitCost,
                                  },
                              },
                          }
                        : {}),
                },
                include: {
                    supplierQuotes: { include: { supplier: true } },
                    inventoryItems: { include: { location: true } },
                },
            });
        });
    },

    async updateCatalogue(
        orgId: string,
        catalogueId: string,
        payload: UpdateCataloguePayload,
    ) {
        return await prisma.$transaction(async (tx) => {
            const existingCatalogue = await tx.catalogue.findFirstOrThrow({
                where: { id: catalogueId, organizationId: orgId },
                include: { inventoryItems: true },
            });

            const catalogueData = {
                ...(payload.name === undefined ? {} : { name: payload.name }),
                ...(payload.category === undefined
                    ? {}
                    : { category: payload.category }),
                ...(payload.unit === undefined ? {} : { unit: payload.unit }),
                ...(payload.defaultLeadTime === undefined
                    ? {}
                    : { defaultLeadTime: payload.defaultLeadTime }),
            };

            if (Object.keys(catalogueData).length > 0) {
                await tx.catalogue.update({
                    where: { id: existingCatalogue.id },
                    data: catalogueData,
                });
            }

            if (payload.inventory) {
                const inventoryItem = await tx.inventoryItem.findFirstOrThrow({
                    where: { catalogueId: existingCatalogue.id },
                    orderBy: { id: "asc" },
                });

                const inventoryData = {
                    ...(payload.inventory.quantityOnHand === undefined
                        ? {}
                        : { quantityOnHand: payload.inventory.quantityOnHand }),
                    ...(payload.inventory.averageUnitCost === undefined
                        ? {}
                        : { averageUnitCost: payload.inventory.averageUnitCost }),
                };

                if (Object.keys(inventoryData).length > 0) {
                    await tx.inventoryItem.update({
                        where: { id: inventoryItem.id },
                        data: inventoryData,
                    });
                }
            }

            if (
                payload.supplier?.truePrice !== undefined ||
                payload.supplier?.standardRate !== undefined ||
                payload.supplier?.leadTimeDays !== undefined
            ) {
                const activeQuote = await tx.supplierQuote.findFirstOrThrow({
                    where: {
                        catalogueId: existingCatalogue.id,
                        validUntil: null,
                    },
                    orderBy: { createdAt: "desc" },
                });

                await tx.supplierQuote.update({
                    where: { id: activeQuote.id },
                    data: { validUntil: new Date() },
                });

                await tx.supplierQuote.create({
                    data: {
                        catalogueId: existingCatalogue.id,
                        supplierId: activeQuote.supplierId,
                        truePrice:
                            payload.supplier?.truePrice ??
                            activeQuote.truePrice,
                        standardRate:
                            payload.supplier?.standardRate ??
                            activeQuote.standardRate,
                        leadTimeDays:
                            payload.supplier?.leadTimeDays ??
                            activeQuote.leadTimeDays,
                    },
                });
            }

            return await tx.catalogue.findUniqueOrThrow({
                where: { id: existingCatalogue.id },
                include: {
                    supplierQuotes: {
                        include: { supplier: true },
                        orderBy: { createdAt: "desc" },
                    },
                    inventoryItems: { include: { location: true } },
                },
            });
        });
    },

    async deleteCatalogue(orgId: string, catalogueId: string) {
        const catalogue = await prisma.catalogue.findFirstOrThrow({
            where: { id: catalogueId, organizationId: orgId },
            select: {
                id: true,
                _count: {
                    select: { inventoryItems: true, requisitionItems: true },
                },
            },
        });

        if (
            catalogue._count.inventoryItems > 0 ||
            catalogue._count.requisitionItems > 0
        ) {
            throw new ValidationError(
                "Cannot delete this item because it is currently tied to historical project requisitions or warehouse inventory.",
            );
        }

        await prisma.catalogue.delete({ where: { id: catalogue.id } });
    },

    async createQuote(
        orgId: string,
        catalogueId: string,
        payload: CreateQuotePayload,
    ) {
        await prisma.catalogue.findFirstOrThrow({
            where: { id: catalogueId, organizationId: orgId },
        });

        await prisma.supplier.findFirstOrThrow({
            where: { id: payload.supplierId, organizationId: orgId },
        });

        return await prisma.supplierQuote.create({
            data: {
                catalogueId,
                supplierId: payload.supplierId,
                truePrice: payload.truePrice,
                standardRate: payload.standardRate,
                leadTimeDays: payload.leadTimeDays ?? null,
            },
            include: {
                supplier: { select: { id: true, name: true } },
            },
        });
    },

    async updateQuote(
        orgId: string,
        catalogueId: string,
        quoteId: string,
        payload: UpdateQuotePayload,
    ) {
        await prisma.supplierQuote.findFirstOrThrow({
            where: {
                id: quoteId,
                catalogueId: catalogueId,
                catalogue: { organizationId: orgId },
            },
        });

        const updateData = {
            ...(payload.truePrice === undefined
                ? {}
                : { truePrice: payload.truePrice }),
            ...(payload.standardRate === undefined
                ? {}
                : { standardRate: payload.standardRate }),
            ...(payload.leadTimeDays === undefined
                ? {}
                : { leadTimeDays: payload.leadTimeDays }),
            ...(payload.validUntil === undefined
                ? {}
                : { validUntil: payload.validUntil }),
        };

        return await prisma.supplierQuote.update({
            where: { id: quoteId },
            data: updateData,
            include: {
                supplier: { select: { id: true, name: true } },
            },
        });
    },
    
    async deleteQuote(orgId: string, catalogueId: string, quoteId: string) {
        const quote = await prisma.supplierQuote.findFirstOrThrow({
            where: {
                id: quoteId,
                catalogueId: catalogueId,
                catalogue: { organizationId: orgId },
            },
            select: {
                id: true,
                _count: { select: { requisitionItems: true } },
            },
        });

        if (quote._count.requisitionItems > 0) {
            throw new ValidationError(
                "Cannot delete this quote because it is currently tied to historical project requisitions.",
            );
        }

        await prisma.supplierQuote.delete({
            where: { id: quote.id },
        });
    },
};
