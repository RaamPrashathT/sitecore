import api from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface PhasePayload {
    name: string;
    description?: string;
    budget: number;
    startDate: string | Date;
    paymentDeadline: string | Date;
}

export const usePhaseDetails = (orgSlug?: string, projectSlug?: string, phaseId?: string | null) => {
    return useQuery({
        queryKey: ["phaseDetails", orgSlug, projectSlug, phaseId],
        queryFn: async () => {
            const { data } = await api.get(`/project/phase/${phaseId}/details`);
            return data.phaseSnapshot; 
        },
        enabled: !!orgSlug && !!projectSlug && !!phaseId,
    });
};

export const useCreatePhase = (orgSlug: string, projectSlug: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: PhasePayload) => {
            const response = await api.post("/project/phase", data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projectTimeline", orgSlug, projectSlug] });
        },
    });
};

export const useUpdatePhase = (orgSlug: string, projectSlug: string, phaseId: string | null) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: Partial<PhasePayload>) => {
            const response = await api.put(`/project/phase/${phaseId}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projectTimeline", orgSlug, projectSlug] });
            queryClient.invalidateQueries({ queryKey: ["phaseDetails", orgSlug, projectSlug, phaseId] });
        },
    });
};