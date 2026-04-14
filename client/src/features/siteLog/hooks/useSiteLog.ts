import api from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MaterialConsumed {
    catalogueId: string;
    locationId: string;
    quantity: number;
}

export interface CreateSiteLogPayload {
    title: string;
    description?: string;
    workDate: Date;
    images: string[];
    materialsConsumed: MaterialConsumed[];
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useCreateSiteLog(
    orgSlug: string,
    projectSlug: string,
    phaseSlug: string,
) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateSiteLogPayload) => {
            const res = await api.post(
                `/project/phase/${phaseSlug}/sitelog`,
                data,
            );
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["phaseDetails", orgSlug, projectSlug, phaseSlug],
            });
            queryClient.invalidateQueries({
                queryKey: ["projectPhases", orgSlug, projectSlug],
            });
        },
    });
}
