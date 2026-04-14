import api from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useOrgId } from "@/hooks/useOrgId";
import { catalogueKeys, type SupplierQuoteType } from "./useCatalogue";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CreateSupplierQuoteInput = {
    catalogueId: string;
    supplierId: string;
    truePrice: number;
    standardRate: number;
    leadTimeDays?: number;
    validUntil?: string;
};

export type EditSupplierQuoteInput = {
    quoteId: string;
    truePrice?: number;
    standardRate?: number;
    leadTimeDays?: number;
    validUntil?: string;
};

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const quoteKeys = {
    byCatalogue: (orgId: string, catalogueId: string) =>
        ["quotes", orgId, catalogueId] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useGetQuotesByCatalogue(catalogueId: string | undefined) {
    const orgId = useOrgId();
    return useQuery({
        queryKey: quoteKeys.byCatalogue(orgId, catalogueId ?? ""),
        queryFn: async () => {
            const res = await api.get<SupplierQuoteType[]>(
                `/catalogue/${catalogueId}/quotes`,
            );
            return res.data;
        },
        enabled: !!orgId && !!catalogueId,
    });
}

export function useCreateSupplierQuote() {
    const queryClient = useQueryClient();
    const orgId = useOrgId();
    return useMutation({
        mutationFn: async (data: CreateSupplierQuoteInput) => {
            const res = await api.post("/catalogue/supplier-quote", data);
            return res.data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: quoteKeys.byCatalogue(orgId, variables.catalogueId),
            });
            queryClient.invalidateQueries({ queryKey: catalogueKeys.all(orgId) });
        },
    });
}

export function useEditSupplierQuote() {
    const queryClient = useQueryClient();
    const orgId = useOrgId();
    return useMutation({
        mutationFn: async ({ quoteId, ...data }: EditSupplierQuoteInput) => {
            const res = await api.put(`/catalogue/supplier-quote/${quoteId}`, data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: catalogueKeys.all(orgId) });
        },
    });
}

export function useDeleteSupplierQuote() {
    const queryClient = useQueryClient();
    const orgId = useOrgId();
    return useMutation({
        mutationFn: async (quoteId: string) => {
            const res = await api.delete(`/catalogue/supplier-quote/${quoteId}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: catalogueKeys.all(orgId) });
        },
    });
}
