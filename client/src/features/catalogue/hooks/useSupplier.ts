import api from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useOrgId } from "@/hooks/useOrgId";
import type { SupplierType } from "./useCatalogue";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CreateSupplierInput = {
    name: string;
    contactName?: string;
    email?: string;
    phone?: string;
};

export type EditSupplierInput = Partial<CreateSupplierInput> & { supplierId: string };

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const supplierKeys = {
    all: (orgId: string) => ["suppliers", orgId] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useGetSuppliers() {
    const orgId = useOrgId();
    return useQuery({
        queryKey: supplierKeys.all(orgId),
        queryFn: async () => {
            const res = await api.get<SupplierType[]>("/catalogue/supplier");
            return res.data;
        },
        enabled: !!orgId,
    });
}

export function useCreateSupplier() {
    const queryClient = useQueryClient();
    const orgId = useOrgId();
    return useMutation({
        mutationFn: async (data: CreateSupplierInput) => {
            const res = await api.post("/catalogue/supplier", data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: supplierKeys.all(orgId) });
        },
    });
}

export function useEditSupplier() {
    const queryClient = useQueryClient();
    const orgId = useOrgId();
    return useMutation({
        mutationFn: async ({ supplierId, ...data }: EditSupplierInput) => {
            const res = await api.put(`/catalogue/supplier/${supplierId}`, data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: supplierKeys.all(orgId) });
        },
    });
}

export function useDeleteSupplier() {
    const queryClient = useQueryClient();
    const orgId = useOrgId();
    return useMutation({
        mutationFn: async (supplierId: string) => {
            const res = await api.delete(`/catalogue/supplier/${supplierId}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: supplierKeys.all(orgId) });
        },
    });
}
