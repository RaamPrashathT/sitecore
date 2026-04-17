import { queryOptions, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import api from "@/lib/axios";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SupplierQuoteHistoryEntry {
    id: string;
    supplierQuoteId: string;
    truePrice: number;
    standardRate: number;
    leadTime: number | null;
    changeReason: string | null;
    changedByMemberId: string | null;
    changedBy: { username: string; profileImage: string | null } | null;
    changedAt: string;
}

export interface SupplierQuote {
    id: string;
    supplierId: string;
    catalogueId: string;
    truePrice: number;
    standardRate: number;
    leadTime: number | null;
    createdAt: string;
    updatedAt: string;
    supplier: { id: string; name: string };
    catalogue: { id: string; name: string; unit: string; category: string };
    history: SupplierQuoteHistoryEntry[];
}

export interface SupplierQuotesListItem {
    id: string;
    supplierId: string;
    catalogueId: string;
    truePrice: number;
    standardRate: number;
    leadTime: number | null;
    supplier: { id: string; name: string };
}

export interface Supplier {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    contactPerson: string | null;
    address: string | null;
}

export interface UpdateQuoteInput {
    truePrice?: number;
    standardRate?: number;
    leadTime?: number | null;
    changeReason?: string | null;
}

export interface CreateQuoteInput {
    catalogueId: string;
    supplierId: string;
    truePrice: number;
    standardRate: number;
    leadTime?: number;
}

// ─── Query Key Factory ────────────────────────────────────────────────────────

export const supplierQuoteKeys = {
    all: (orgSlug: string) => ["supplier-quotes", orgSlug] as const,
    byCatalogue: (orgSlug: string, catalogueId: string) =>
        ["supplier-quotes", orgSlug, "catalogue", catalogueId] as const,
    detail: (orgSlug: string, quoteId: string) =>
        ["supplier-quotes", orgSlug, "detail", quoteId] as const,
    suppliers: (orgSlug: string) => ["suppliers", orgSlug] as const,
};

// ─── Query Options ────────────────────────────────────────────────────────────

export const supplierQuotesByCatalogueQueryOptions = (
    orgSlug: string,
    catalogueId: string,
) =>
    queryOptions({
        queryKey: supplierQuoteKeys.byCatalogue(orgSlug, catalogueId),
        queryFn: () =>
            api
                .get<{ success: boolean; data: SupplierQuotesListItem[]; count: number }>(
                    `/catalogue/supplier-quotes?catalogueId=${catalogueId}`,
                )
                .then((r) => r.data),
        enabled: !!orgSlug && !!catalogueId,
    });

export const supplierQuoteDetailQueryOptions = (
    orgSlug: string,
    quoteId: string,
) =>
    queryOptions({
        queryKey: supplierQuoteKeys.detail(orgSlug, quoteId),
        queryFn: () =>
            api
                .get<{ success: boolean; data: SupplierQuote }>(
                    `/catalogue/supplier-quotes/${quoteId}`,
                )
                .then((r) => r.data),
        enabled: !!orgSlug && !!quoteId,
    });

export const suppliersQueryOptions = (orgSlug: string) =>
    queryOptions({
        queryKey: supplierQuoteKeys.suppliers(orgSlug),
        queryFn: () =>
            api
                .get<{ success: boolean; data: Supplier[]; count: number }>(
                    `/catalogue/suppliers`,
                )
                .then((r) => r.data),
        enabled: !!orgSlug,
    });

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useGetSupplierQuotesByCatalogue() {
    const { orgSlug, catalogueId } = useParams<{
        orgSlug: string;
        catalogueId: string;
    }>();

    return useQuery(
        supplierQuotesByCatalogueQueryOptions(orgSlug ?? "", catalogueId ?? ""),
    );
}

export function useGetSupplierQuoteDetail(quoteId: string, enabled: boolean) {
    const { orgSlug } = useParams<{ orgSlug: string }>();

    return useQuery({
        ...supplierQuoteDetailQueryOptions(orgSlug ?? "", quoteId),
        enabled: !!orgSlug && !!quoteId && enabled,
    });
}

export function useGetSuppliers() {
    const { orgSlug } = useParams<{ orgSlug: string }>();

    return useQuery(suppliersQueryOptions(orgSlug ?? ""));
}

export function useUpdateQuote(quoteId: string) {
    const queryClient = useQueryClient();
    const { orgSlug, catalogueId } = useParams<{
        orgSlug: string;
        catalogueId: string;
    }>();

    return useMutation({
        mutationFn: (data: UpdateQuoteInput) =>
            api
                .patch<{ success: boolean; data: { id: string } }>(
                    `/catalogue/supplier-quotes/${quoteId}`,
                    data,
                )
                .then((r) => r.data),
        onMutate: async (variables) => {
            const detailKey = supplierQuoteKeys.detail(orgSlug ?? "", quoteId);
            await queryClient.cancelQueries({ queryKey: detailKey });
            const previous = queryClient.getQueryData<{ success: boolean; data: SupplierQuote }>(detailKey);

            if (previous?.data) {
                const optimisticEntry: SupplierQuoteHistoryEntry = {
                    id: `optimistic-${Date.now()}`,
                    supplierQuoteId: quoteId,
                    truePrice: previous.data.truePrice,
                    standardRate: previous.data.standardRate,
                    leadTime: previous.data.leadTime,
                    changeReason: variables.changeReason ?? null,
                    changedByMemberId: null,
                    changedBy: null,
                    changedAt: new Date().toISOString(),
                };

                queryClient.setQueryData<{ success: boolean; data: SupplierQuote }>(detailKey, {
                    ...previous,
                    data: {
                        ...previous.data,
                        truePrice: variables.truePrice ?? previous.data.truePrice,
                        standardRate: variables.standardRate ?? previous.data.standardRate,
                        leadTime: variables.leadTime !== undefined ? variables.leadTime : previous.data.leadTime,
                        history: [optimisticEntry, ...previous.data.history],
                    },
                });
            }

            return { previous };
        },
        onError: (_err, _vars, context) => {
            if (context?.previous) {
                queryClient.setQueryData(
                    supplierQuoteKeys.detail(orgSlug ?? "", quoteId),
                    context.previous,
                );
            }
            toast.error("Failed to update quote");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: supplierQuoteKeys.byCatalogue(orgSlug ?? "", catalogueId ?? ""),
            });
            queryClient.invalidateQueries({
                queryKey: supplierQuoteKeys.detail(orgSlug ?? "", quoteId),
            });
            toast.success("Quote updated");
        },
    });
}

export function useCreateQuote() {
    const queryClient = useQueryClient();
    const { orgSlug, catalogueId } = useParams<{
        orgSlug: string;
        catalogueId: string;
    }>();

    return useMutation({
        mutationFn: (data: CreateQuoteInput) =>
            api
                .post<{ success: boolean; data: { id: string } }>(
                    `/catalogue/supplier-quotes`,
                    data,
                )
                .then((r) => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: supplierQuoteKeys.byCatalogue(orgSlug ?? "", catalogueId ?? ""),
            });
            toast.success("Quote created");
        },
        onError: () => toast.error("Failed to create quote"),
    });
}
