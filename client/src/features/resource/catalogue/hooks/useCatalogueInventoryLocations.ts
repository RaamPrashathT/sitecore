import { queryOptions, useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import api from "@/lib/axios";

export type CatalogueInventoryLocationType = "WAREHOUSE" | "PROJECT";

export interface CatalogueInventoryLocation {
    id: string;
    name: string;
    code: string | null;
    type: CatalogueInventoryLocationType;
    projectId: string | null;
    isActive: boolean;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
    stockId: string;
    quantityStored: number;
    lastUpdatedAt: string;
}

export interface CatalogueInventoryLocationsResponse {
    success: boolean;
    message: string;
    data: CatalogueInventoryLocation[];
    count: number;
    pageIndex: number;
    pageSize: number;
}

export const catalogueInventoryLocationKeys = {
    all: (orgSlug: string) => ["catalogue", "inventory-locations", orgSlug] as const,
    byCatalogue: (orgSlug: string, catalogueId: string) =>
        ["catalogue", "inventory-locations", orgSlug, catalogueId] as const,
};

export const catalogueInventoryLocationsQueryOptions = (
    orgSlug: string,
    catalogueId: string,
) =>
    queryOptions({
        queryKey: catalogueInventoryLocationKeys.byCatalogue(orgSlug, catalogueId),
        queryFn: () =>
            api
                .get<CatalogueInventoryLocationsResponse>(
                    `/catalogue/inventory/locations?catalogueId=${encodeURIComponent(catalogueId)}&size=100`,
                )
                .then((r) => r.data),
        enabled: !!orgSlug && !!catalogueId,
    });

export function useCatalogueInventoryLocations() {
    const { orgSlug, catalogueId } = useParams<{
        orgSlug: string;
        catalogueId: string;
    }>();

    return useQuery(
        catalogueInventoryLocationsQueryOptions(orgSlug ?? "", catalogueId ?? ""),
    );
}
