import { useQuery, keepPreviousData, queryOptions } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { CatalogueListResponse, CatalogueItem } from '../catalogue.schema'

// ─── Query Key Factory ────────────────────────────────────────────────────────

export const catalogueKeys = {
    all: (orgId: string) => ['catalogue', orgId] as const,
    list: (orgId: string, index: number, size: number, search: string) =>
        ['catalogue', orgId, 'list', index, size, search] as const,
    detail: (orgId: string, id: string) => ['catalogue', orgId, id] as const,
}

// ─── Query Options Factory ────────────────────────────────────────────────────

export const catalogueListQueryOptions = (
    orgId: string,
    index: number,
    size: number,
    search: string,
) =>
    queryOptions({
        queryKey: catalogueKeys.list(orgId, index, size, search),
        queryFn: async () => {
            const res = await api.get<CatalogueListResponse>(
                `/catalogue/?index=${index}&size=${size}&search=${encodeURIComponent(search)}`,
            )
            return res.data
        },
        enabled: !!orgId,
        placeholderData: keepPreviousData,
    })

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useCatalogueList(
    orgId: string | undefined,
    index: number,
    size: number,
    search: string,
) {
    return useQuery({
        ...catalogueListQueryOptions(orgId ?? '', index, size, search),
        enabled: !!orgId,
    })
}

// Typed accessor for a single item from the list cache (no extra request)
export function useCatalogueItem(items: CatalogueItem[] | undefined, id: string) {
    return items?.find((item) => item.id === id) ?? null
}
