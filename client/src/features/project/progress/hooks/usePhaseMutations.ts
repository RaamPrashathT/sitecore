import api from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface PhaseFormPayload {
    name: string;
    description?: string;
    budget: number;
    startDate: string;
    paymentDeadline: string;
}

export const usePhaseDetails = (orgSlug?: string, projectSlug?: string, phaseId?: string) => {
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
        mutationFn: async (data: PhaseFormPayload) => {
            const response = await api.post("/project/phase", data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projectTimeline", orgSlug, projectSlug] });
        },
    });
};

export const useUpdatePhase = (orgSlug: string, projectSlug: string, phaseId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: Partial<PhaseFormPayload>) => {
            const response = await api.put(`/project/phase/${phaseId}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projectTimeline", orgSlug, projectSlug] });
            queryClient.invalidateQueries({ queryKey: ["phaseDetails", orgSlug, projectSlug, phaseId] });
        },
    });
};