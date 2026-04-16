import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import { catalogueKeys } from './useCatalogue'
import type {
    CatalogueItemDetail,
    CatalogueQuoteRow,
    CatalogueSupplierRow,
    CatalogueStockRow,
    UpdateCatalogueItemInput,
    UpdateQuoteInput,
    UpdateSupplierInput,
} from '../catalogue.schema'

// ─── Response wrappers ────────────────────────────────────────────────────────

interface ApiResponse<T> {
    success: boolean
    message: string
    data: T
}

interface ApiListResponse<T> {
    success: boolean
    message: string
    data: T[]
    count?: number
}

// ─── Query key extensions ─────────────────────────────────────────────────────

export const drawerKeys = {
    detail: (id: string) => ['catalogue-detail', id] as const,
    quotes: (id: string) => ['catalogue-quotes', id] as const,
    suppliers: (id: string) => ['catalogue-suppliers', id] as const,
    stocks: (id: string) => ['catalogue-stocks', id] as const,
}

// ─── Detail ───────────────────────────────────────────────────────────────────

export function useCatalogueDetail(catalogueId: string | null) {
    return useQuery({
        queryKey: drawerKeys.detail(catalogueId ?? ''),
        queryFn: async () => {
            const res = await api.get<ApiResponse<CatalogueItemDetail>>(
                `/catalogue/${catalogueId}`,
            )
            return res.data.data
        },
        enabled: !!catalogueId,
    })
}

export function useUpdateCatalogueItem(catalogueId: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: Omit<UpdateCatalogueItemInput, 'id'>) =>
            api.patch(`/catalogue/${catalogueId}`, data).then((r) => r.data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: drawerKeys.detail(catalogueId) })
            // Also invalidate the list so counts/names stay fresh
            void queryClient.invalidateQueries({ queryKey: ['catalogue'] })
        },
    })
}

// ─── Quotes ───────────────────────────────────────────────────────────────────

export function useCatalogueQuotes(catalogueId: string | null) {
    return useQuery({
        queryKey: drawerKeys.quotes(catalogueId ?? ''),
        queryFn: async () => {
            const res = await api.get<ApiListResponse<CatalogueQuoteRow>>(
                `/catalogue/${catalogueId}/quotes`,
            )
            return res.data.data
        },
        enabled: !!catalogueId,
    })
}

export function useUpdateQuote(catalogueId: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ quoteId, ...data }: UpdateQuoteInput & { quoteId: string }) =>
            api.patch(`/catalogue/supplier-quotes/${quoteId}`, data).then((r) => r.data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: drawerKeys.quotes(catalogueId) })
            void queryClient.invalidateQueries({ queryKey: drawerKeys.suppliers(catalogueId) })
            void queryClient.invalidateQueries({ queryKey: drawerKeys.stocks(catalogueId) })
        },
    })
}

// ─── Suppliers ────────────────────────────────────────────────────────────────

export function useCatalogueSuppliers(catalogueId: string | null) {
    return useQuery({
        queryKey: drawerKeys.suppliers(catalogueId ?? ''),
        queryFn: async () => {
            const res = await api.get<ApiListResponse<CatalogueSupplierRow>>(
                `/catalogue/${catalogueId}/suppliers`,
            )
            return res.data.data
        },
        enabled: !!catalogueId,
    })
}

export function useUpdateSupplier(catalogueId: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ supplierId, ...data }: UpdateSupplierInput & { supplierId: string }) =>
            api.patch(`/catalogue/suppliers/${supplierId}`, data).then((r) => r.data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: drawerKeys.suppliers(catalogueId) })
        },
    })
}

// ─── Stocks ───────────────────────────────────────────────────────────────────

export function useCatalogueStocks(catalogueId: string | null) {
    return useQuery({
        queryKey: drawerKeys.stocks(catalogueId ?? ''),
        queryFn: async () => {
            const res = await api.get<ApiListResponse<CatalogueStockRow>>(
                `/catalogue/inventory/catalogue-items/${catalogueId}/stocks`,
            )
            return res.data.data
        },
        enabled: !!catalogueId,
    })
}
