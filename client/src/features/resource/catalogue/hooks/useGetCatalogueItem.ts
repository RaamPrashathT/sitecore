import { queryOptions, useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import api from "@/lib/axios";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CatalogueStockLocation {
    locationId: string;
    locationName: string;
    locationType: string;
    locationUpdatedAt: string;
    quantity: number;
}

export interface CatalogueStockSummary {
    totalQuantity: number;
    locations: CatalogueStockLocation[];
}

export interface CatalogueQuote {
    id: string;
    supplierId: string;
    supplierName: string;
    truePrice: number;
    standardRate: number;
    leadTime: number | null;
    inventory: number;
    profit: number;
    isHighestProfit: boolean;
    isShortestLeadTime: boolean;
}

export interface CatalogueSupplierSummary {
    activeSuppliersCount: number;
    quotes: CatalogueQuote[];
}

export interface CatalogueItem {
    id: string;
    name: string;
    category: string;
    unit: string;
    defaultLeadTime: number;
    stockSummary: CatalogueStockSummary;
    supplierSummary: CatalogueSupplierSummary;
}

export interface CatalogueItemResponse {
    success: boolean;
    message: string;
    data: CatalogueItem;
}

// ─── Query Key Factory ────────────────────────────────────────────────────────

export const catalogueItemKeys = {
    all: (orgSlug: string) => ["catalogue", "item", orgSlug] as const,
    detail: (orgSlug: string, catalogueId: string) =>
        ["catalogue", "item", orgSlug, catalogueId] as const,
};

// ─── Query Options Factory ────────────────────────────────────────────────────

export const catalogueItemQueryOptions = (
    orgSlug: string,
    catalogueId: string,
) =>
    queryOptions({
        queryKey: catalogueItemKeys.detail(orgSlug, catalogueId),
        queryFn: () =>
            api
                .get<CatalogueItemResponse>(`/catalogue/${catalogueId}`)
                .then((r) => r.data),
        enabled: !!orgSlug && !!catalogueId,
    });

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useGetCatalogueItem() {
    const { orgSlug, catalogueId } = useParams<{
        orgSlug: string;
        catalogueId: string;
    }>();

    return useQuery(
        catalogueItemQueryOptions(orgSlug ?? "", catalogueId ?? ""),
    );
}
