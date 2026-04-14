import api from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MaterialLine {
    id: string;
    quantityChange: number;
    inventoryItem: {
        averageUnitCost: number;
        catalogue: { name: string; unit: string };
    };
}

export interface BilledLog {
    id: string;
    title: string;
    workDate: string;
    materialsUsed: MaterialLine[];
}

export interface Invoice {
    id: string;
    amount: number;
    status: "PENDING" | "PAID";
    createdAt: string;
    paidAt: string | null;
    billedLogs: BilledLog[];
}

// ─── Keys ─────────────────────────────────────────────────────────────────────

export const invoiceKeys = {
    list: (orgSlug: string, projectSlug: string, phaseId: string) =>
        ["invoices", orgSlug, projectSlug, phaseId] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useGetInvoices(
    orgSlug: string,
    projectSlug: string,
    phaseId: string | null,
) {
    return useQuery({
        queryKey: invoiceKeys.list(orgSlug, projectSlug, phaseId ?? ""),
        queryFn: async () => {
            const { data } = await api.get<Invoice[]>(
                `/project/phase/${phaseId}/invoices`,
            );
            return data;
        },
        enabled: !!orgSlug && !!projectSlug && !!phaseId,
    });
}

export function useGenerateInvoice(orgSlug: string, projectSlug: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (phaseId: string) => {
            const { data } = await api.post<Invoice>(
                `/project/phase/${phaseId}/generate-invoice`,
            );
            return data;
        },
        onSuccess: (_, phaseId) => {
            queryClient.invalidateQueries({
                queryKey: invoiceKeys.list(orgSlug, projectSlug, phaseId),
            });
        },
    });
}

export function usePayInvoice(
    orgSlug: string,
    projectSlug: string,
    phaseId: string,
) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (invoiceId: string) => {
            const { data } = await api.put<Invoice>(
                `/project/invoice/${invoiceId}/pay`,
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: invoiceKeys.list(orgSlug, projectSlug, phaseId),
            });
        },
    });
}

export function useSendInvoice(
    orgSlug: string,
    projectSlug: string,
    phaseId: string,
) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (invoiceId: string) => {
            const { data } = await api.post(
                `/project/invoice/${invoiceId}/send`,
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: invoiceKeys.list(orgSlug, projectSlug, phaseId),
            });
        },
    });
}
