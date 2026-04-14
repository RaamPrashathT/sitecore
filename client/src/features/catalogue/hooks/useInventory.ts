import api from "@/lib/axios";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useOrgId } from "@/hooks/useOrgId";
import type { InventoryLocationType } from "./useInventoryLocation";
import type { CatalogueItemType } from "./useCatalogue";

// ─── Types ────────────────────────────────────────────────────────────────────

export type InventoryItemType = {
    id: string;
    quantityOnHand: number;
    averageUnitCost: number;
    locationId: string;
    catalogueId: string;
    location: InventoryLocationType;
    catalogue: CatalogueItemType;
};

export type TransactionType = "RECEIVED" | "CONSUMED" | "ADJUSTED";

export type InventoryTransactionType = {
    id: string;
    quantityChange: number;
    type: TransactionType;
    notes: string | null;
    createdAt: string;
    phaseId: string | null;
    inventoryItemId: string;
    inventoryItem: {
        id: string;
        catalogue: { id: string; name: string; unit: string };
        location: { id: string; name: string };
    };
    recordedBy: { id: string; userId: string };
    phase: { id: string; name: string } | null;
};

export type InventoryTransactionListResponse = {
    data: InventoryTransactionType[];
    count: number;
};

export type ReceiveMaterialInput = {
    catalogueId: string;
    locationId: string;
    quantity: number;
    unitCost?: number;
    notes?: string;
};

export type ConsumeMaterialInput = {
    catalogueId: string;
    locationId: string;
    quantity: number;
    phaseId: string;
    notes?: string;
};

export type AdjustMaterialInput = {
    catalogueId: string;
    locationId: string;
    quantity: number;
    notes: string;
};

export type GetTransactionsParams = {
    catalogueId?: string;
    locationId?: string;
    pageIndex?: number;
    pageSize?: number;
};

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const inventoryKeys = {
    balances: (orgId: string) => ["inventory-balances", orgId] as const,
    transactions: (orgId: string, params: GetTransactionsParams) =>
        ["inventory-transactions", orgId, params] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useGetInventoryBalances() {
    const orgId = useOrgId();
    return useQuery({
        queryKey: inventoryKeys.balances(orgId),
        queryFn: async () => {
            const res = await api.get<InventoryItemType[]>("/catalogue/inventory");
            return res.data;
        },
        enabled: !!orgId,
    });
}

export function useGetInventoryTransactions(params: GetTransactionsParams = {}) {
    const orgId = useOrgId();
    const { pageIndex = 0, pageSize = 20, catalogueId, locationId } = params;

    const query = new URLSearchParams({
        index: String(pageIndex),
        size: String(pageSize),
    });
    if (catalogueId) query.set("catalogueId", catalogueId);
    if (locationId) query.set("locationId", locationId);

    return useQuery({
        queryKey: inventoryKeys.transactions(orgId, params),
        queryFn: async () => {
            const res = await api.get<InventoryTransactionListResponse>(
                `/catalogue/inventory/transactions?${query.toString()}`,
            );
            return res.data;
        },
        enabled: !!orgId,
        placeholderData: keepPreviousData,
    });
}

export function useReceiveMaterial() {
    const queryClient = useQueryClient();
    const orgId = useOrgId();
    return useMutation({
        mutationFn: async (data: ReceiveMaterialInput) => {
            const res = await api.post("/catalogue/inventory/receive", data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.balances(orgId) });
            queryClient.invalidateQueries({ queryKey: ["inventory-transactions", orgId] });
        },
    });
}

export function useConsumeMaterial() {
    const queryClient = useQueryClient();
    const orgId = useOrgId();
    return useMutation({
        mutationFn: async (data: ConsumeMaterialInput) => {
            const res = await api.post("/catalogue/inventory/consume", data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.balances(orgId) });
            queryClient.invalidateQueries({ queryKey: ["inventory-transactions", orgId] });
        },
    });
}

export function useAdjustMaterial() {
    const queryClient = useQueryClient();
    const orgId = useOrgId();
    return useMutation({
        mutationFn: async (data: AdjustMaterialInput) => {
            const res = await api.post("/catalogue/inventory/adjust", data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.balances(orgId) });
            queryClient.invalidateQueries({ queryKey: ["inventory-transactions", orgId] });
        },
    });
}
