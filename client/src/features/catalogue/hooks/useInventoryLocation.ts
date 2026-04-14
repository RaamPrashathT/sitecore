import api from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useOrgId } from "@/hooks/useOrgId";

// ─── Types ────────────────────────────────────────────────────────────────────

export type InventoryLocationType = {
    id: string;
    name: string;
    type: string;
    organizationId: string;
};

export type CreateInventoryLocationInput = {
    name: string;
    type: string;
};

export type EditInventoryLocationInput = Partial<CreateInventoryLocationInput> & {
    locationId: string;
};

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const inventoryLocationKeys = {
    all: (orgId: string) => ["inventory-locations", orgId] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useGetInventoryLocations() {
    const orgId = useOrgId();
    return useQuery({
        queryKey: inventoryLocationKeys.all(orgId),
        queryFn: async () => {
            const res = await api.get<InventoryLocationType[]>("/catalogue/inventory-location");
            return res.data;
        },
        enabled: !!orgId,
    });
}

export function useCreateInventoryLocation() {
    const queryClient = useQueryClient();
    const orgId = useOrgId();
    return useMutation({
        mutationFn: async (data: CreateInventoryLocationInput) => {
            const res = await api.post("/catalogue/inventory-location", data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: inventoryLocationKeys.all(orgId) });
        },
    });
}

export function useEditInventoryLocation() {
    const queryClient = useQueryClient();
    const orgId = useOrgId();
    return useMutation({
        mutationFn: async ({ locationId, ...data }: EditInventoryLocationInput) => {
            const res = await api.put(`/catalogue/inventory-location/${locationId}`, data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: inventoryLocationKeys.all(orgId) });
        },
    });
}

export function useDeleteInventoryLocation() {
    const queryClient = useQueryClient();
    const orgId = useOrgId();
    return useMutation({
        mutationFn: async (locationId: string) => {
            const res = await api.delete(`/catalogue/inventory-location/${locationId}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: inventoryLocationKeys.all(orgId) });
        },
    });
}
