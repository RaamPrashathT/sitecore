import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useParams } from "react-router-dom";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CatalogueListItem {
    id: string;
    name: string;
}

export interface CatalogueMasterResponse {
    success: boolean;
    message: string;
    data: CatalogueListItem[];
    count: number;
}

// ─── Query Key Factory ────────────────────────────────────────────────────────

export const catalogueMasterKeys = {
    all: (orgSlug: string) => ["catalogue", "master", orgSlug] as const,
    search: (orgSlug: string, search: string) =>
        ["catalogue", "master", orgSlug, search] as const,
};

// ─── Query Options Factory ────────────────────────────────────────────────────

export const catalogueMasterQueryOptions = (orgSlug: string, search: string) =>
    queryOptions({
        queryKey: catalogueMasterKeys.search(orgSlug, search),
        queryFn: () =>
            api
                .get<CatalogueMasterResponse>(`/catalogue/?search=${search}`)
                .then((r) => r.data),
        enabled: !!orgSlug,
        placeholderData: keepPreviousData,
    });

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useGetCatalogueMaster(search: string) {
    const { orgSlug } = useParams<{ orgSlug: string }>();

    return useQuery(catalogueMasterQueryOptions(orgSlug ?? "", search));
}
