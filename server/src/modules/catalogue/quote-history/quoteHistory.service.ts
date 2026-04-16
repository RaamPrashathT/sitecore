import { prisma } from "../../../shared/lib/prisma.js";
import { MissingError } from "../../../shared/error/missing.error.js";

const quoteHistoryService = {
    async getQuoteHistory(orgId: string, quoteId: string, pageIndex: number, pageSize: number) {
        const quote = await prisma.supplierQuote.findFirst({
            where: {
                id: quoteId,
                catalogue: { organizationId: orgId },
            },
            select: { id: true },
        });

        if (!quote) throw new MissingError("Supplier quote not found");

        const skip = pageIndex * pageSize;

        const [history, count] = await Promise.all([
            prisma.supplierQuoteHistory.findMany({
                where: { supplierQuoteId: quoteId },
                skip,
                take: pageSize,
                orderBy: { changedAt: "desc" },
                select: {
                    id: true,
                    supplierQuoteId: true,
                    truePrice: true,
                    standardRate: true,
                    leadTime: true,
                    changeReason: true,
                    changedByMemberId: true,
                    changedAt: true,
                },
            }),
            prisma.supplierQuoteHistory.count({ where: { supplierQuoteId: quoteId } }),
        ]);

        const data = history.map((h) => ({
            ...h,
            truePrice: Number(h.truePrice),
            standardRate: Number(h.standardRate),
        }));

        return { data, count };
    },

    async getQuoteHistoryById(orgId: string, quoteId: string, historyId: string) {
        const quote = await prisma.supplierQuote.findFirst({
            where: {
                id: quoteId,
                catalogue: { organizationId: orgId },
            },
            select: { id: true },
        });

        if (!quote) throw new MissingError("Supplier quote not found");

        const entry = await prisma.supplierQuoteHistory.findFirst({
            where: { id: historyId, supplierQuoteId: quoteId },
            select: {
                id: true,
                supplierQuoteId: true,
                truePrice: true,
                standardRate: true,
                leadTime: true,
                changeReason: true,
                changedByMemberId: true,
                changedAt: true,
            },
        });

        if (!entry) throw new MissingError("Quote history entry not found");

        return {
            ...entry,
            truePrice: Number(entry.truePrice),
            standardRate: Number(entry.standardRate),
        };
    },
};

export default quoteHistoryService;
