import api from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface UpdatePhasePayload {
    name?: string;
    description?: string;
    budget?: number;
    startDate?: string;
    paymentDeadline?: string;
}

export const useUpdatePhase = (orgSlug: string, projectSlug: string, phaseSlug: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: UpdatePhasePayload) => {
            const response = await api.put(`/project/phase/${phaseSlug}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["phaseDetails", orgSlug, projectSlug, phaseSlug] });
            queryClient.invalidateQueries({ queryKey: ["projectPhases", orgSlug, projectSlug] });
        },
    });
};