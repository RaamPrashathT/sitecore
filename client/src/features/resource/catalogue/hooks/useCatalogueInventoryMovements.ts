import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import api from "@/lib/axios";
import { catalogueItemKeys } from "./useGetCatalogueItem";
import { catalogueInventoryLocationKeys } from "./useCatalogueInventoryLocations";

interface InventoryMovementResponse {
    success: boolean;
    message: string;
    data: {
        id: string;
        type: string;
        catalogue: { id: string; name: string; unit: string };
    };
}

export type CatalogueInventoryMovementType =
    | "RECEIPT"
    | "ISSUE"
    | "TRANSFER_IN"
    | "TRANSFER_OUT"
    | "ADJUSTMENT_ADD"
    | "ADJUSTMENT_SUB"
    | "RETURN_IN"
    | "RETURN_OUT";

export interface CatalogueInventoryMovement {
    id: string;
    type: CatalogueInventoryMovementType;
    quantity: number;
    unitCost: number | null;
    remarks: string | null;
    movementDate: string;
    referenceType: string | null;
    referenceId: string | null;
    transferGroupId: string | null;
    fromLocationId: string | null;
    toLocationId: string | null;
    catalogue: { id: string; name: string; unit: string };
    fromLocation: { id: string; name: string; type: string } | null;
    toLocation: { id: string; name: string; type: string } | null;
}

export interface CatalogueInventoryMovementsResponse {
    success: boolean;
    message: string;
    data: CatalogueInventoryMovement[];
    count: number;
    pageIndex: number;
    pageSize: number;
}

export interface TransferCatalogueStockInput {
    fromLocationId: string;
    toLocationId: string;
    quantity: number;
    remarks?: string | null;
}

export interface DeleteCatalogueStockInput {
    fromLocationId: string;
    quantity: number;
    remarks?: string | null;
}

export const catalogueInventoryMovementKeys = {
    all: (orgSlug: string) => ["catalogue", "inventory-movements", orgSlug] as const,
    byCatalogue: (orgSlug: string, catalogueId: string) =>
        ["catalogue", "inventory-movements", orgSlug, catalogueId] as const,
};

export const catalogueInventoryMovementsQueryOptions = (
    orgSlug: string,
    catalogueId: string,
) =>
    queryOptions({
        queryKey: catalogueInventoryMovementKeys.byCatalogue(orgSlug, catalogueId),
        queryFn: () =>
            api
                .get<CatalogueInventoryMovementsResponse>(
                    `/catalogue/inventory/movements?catalogueId=${encodeURIComponent(catalogueId)}&size=1000`,
                )
                .then((r) => r.data),
        enabled: !!orgSlug && !!catalogueId,
    });

export function useCatalogueInventoryMovements() {
    const { orgSlug, catalogueId } = useParams<{
        orgSlug: string;
        catalogueId: string;
    }>();

    return useQuery(
        catalogueInventoryMovementsQueryOptions(orgSlug ?? "", catalogueId ?? ""),
    );
}

export function useTransferCatalogueStock() {
    const queryClient = useQueryClient();
    const { orgSlug, catalogueId } = useParams<{
        orgSlug: string;
        catalogueId: string;
    }>();

    return useMutation({
        mutationFn: (input: TransferCatalogueStockInput) =>
            api
                .post<InventoryMovementResponse>(
                    "/catalogue/inventory/movements/transfer",
                    {
                        catalogueId: catalogueId ?? "",
                        fromLocationId: input.fromLocationId,
                        toLocationId: input.toLocationId,
                        quantity: input.quantity,
                        remarks: input.remarks ?? null,
                    },
                )
                .then((r) => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: catalogueInventoryLocationKeys.byCatalogue(
                    orgSlug ?? "",
                    catalogueId ?? "",
                ),
            });
            queryClient.invalidateQueries({
                queryKey: catalogueInventoryLocationKeys.all(orgSlug ?? ""),
            });
            queryClient.invalidateQueries({
                queryKey: catalogueItemKeys.detail(orgSlug ?? "", catalogueId ?? ""),
            });
            queryClient.invalidateQueries({
                queryKey: catalogueInventoryMovementKeys.byCatalogue(
                    orgSlug ?? "",
                    catalogueId ?? "",
                ),
            });
            toast.success("Stock transferred");
        },
        onError: () => toast.error("Failed to transfer stock"),
    });
}

export function useDeleteCatalogueStock() {
    const queryClient = useQueryClient();
    const { orgSlug, catalogueId } = useParams<{
        orgSlug: string;
        catalogueId: string;
    }>();

    return useMutation({
        mutationFn: (input: DeleteCatalogueStockInput) =>
            api
                .post<InventoryMovementResponse>(
                    "/catalogue/inventory/movements/issue",
                    {
                        catalogueId: catalogueId ?? "",
                        fromLocationId: input.fromLocationId,
                        quantity: input.quantity,
                        referenceType: "CATALOGUE_STOCK_REDUCTION",
                        remarks: input.remarks ?? "Reduced from catalogue transaction tab",
                    },
                )
                .then((r) => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: catalogueInventoryLocationKeys.byCatalogue(
                    orgSlug ?? "",
                    catalogueId ?? "",
                ),
            });
            queryClient.invalidateQueries({
                queryKey: catalogueItemKeys.detail(orgSlug ?? "", catalogueId ?? ""),
            });
            queryClient.invalidateQueries({
                queryKey: catalogueInventoryMovementKeys.byCatalogue(
                    orgSlug ?? "",
                    catalogueId ?? "",
                ),
            });
            toast.success("Quantity removed");
        },
        onError: () => toast.error("Failed to remove stock"),
    });
}
