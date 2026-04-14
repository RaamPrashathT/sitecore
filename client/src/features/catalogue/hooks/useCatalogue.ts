import api from "@/lib/axios";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useOrgId } from "@/hooks/useOrgId";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CatalogueCategory =
    | "MATERIALS"
    | "LABOUR"
    | "EQUIPMENT"
    | "SUBCONTRACTORS"
    | "TRANSPORT"
    | "OVERHEAD";

export type SupplierType = {
    id: string;
    name: string;
    contactName: string | null;
    email: string | null;
    phone: string | null;
    organizationId: string;
};

export type SupplierQuoteType = {
    id: string;
    truePrice: number;
    standardRate: number;
    leadTimeDays: number | null;
    validUntil: string | null;
    supplierId: string;
    catalogueId: string;
    supplier: SupplierType;
};

export type CatalogueItemType = {
    id: string;
    name: string;
    category: CatalogueCategory;
    unit: string;
    defaultLeadTime: number;
    organizationId: string;
    supplierQuotes: SupplierQuoteType[];
};

export type CatalogueListResponse = {
    data: CatalogueItemType[];
    count: number;
};

export type CreateCatalogueInput = {
    name: string;
    category: CatalogueCategory;
    unit: string;
};

export type EditCatalogueInput = CreateCatalogueInput & { catalogueId: string };

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const catalogueKeys = {
    all: (orgId: string) => ["catalogue", orgId] as const,
    list: (orgId: string, page: number, size: number, search: string) =>
        ["catalogue", orgId, page, size, search] as const,
    detail: (orgId: string, id: string) => ["catalogue", orgId, id] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useGetCatalogues(
    pageIndex: number = 0,
    pageSize: number = 24,
    searchQuery: string = "",
) {
    const orgId = useOrgId();
    return useQuery({
        queryKey: catalogueKeys.list(orgId, pageIndex, pageSize, searchQuery),
        queryFn: async () => {
            const res = await api.get<CatalogueListResponse>(
                `/catalogue?index=${pageIndex}&size=${pageSize}&search=${encodeURIComponent(searchQuery)}`,
            );
            return res.data;
        },
        enabled: !!orgId,
        placeholderData: keepPreviousData,
        select: (data) => ({
            ...data,
            data: data.data.map((item) => ({
                ...item,
                supplierQuotes: item.supplierQuotes ?? [],
            })),
        }),
    });
}

export function useGetCatalogueById(catalogueId: string | undefined) {
    const orgId = useOrgId();
    return useQuery({
        queryKey: catalogueKeys.detail(orgId, catalogueId ?? ""),
        queryFn: async () => {
            const res = await api.get<CatalogueItemType>(`/catalogue/${catalogueId}`);
            return res.data;
        },
        enabled: !!orgId && !!catalogueId,
    });
}

export function useCreateCatalogue() {
    const queryClient = useQueryClient();
    const orgId = useOrgId();
    return useMutation({
        mutationFn: async (data: CreateCatalogueInput) => {
            const res = await api.post("/catalogue", data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: catalogueKeys.all(orgId) });
        },
    });
}

export function useEditCatalogue() {
    const queryClient = useQueryClient();
    const orgId = useOrgId();
    return useMutation({
        mutationFn: async ({ catalogueId, ...data }: EditCatalogueInput) => {
            const res = await api.put("/catalogue", { ...data, catalogueId });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: catalogueKeys.all(orgId) });
        },
    });
}

export function useDeleteCatalogue() {
    const queryClient = useQueryClient();
    const orgId = useOrgId();
    return useMutation({
        mutationFn: async (catalogueId: string) => {
            const res = await api.post("/catalogue/deleteCatalogue", { catalogueId });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: catalogueKeys.all(orgId) });
        },
    });
}
