import api from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface SiteLogPayload {
    title: string;
    description?: string;
    workDate: string | Date;
    images: string[]; 
}

export const useAddSiteLog = (orgSlug: string, projectSlug: string, phaseId: string | null) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: SiteLogPayload) => {
            const response = await api.post(`/project/phase/${phaseId}/sitelog`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projectTimeline", orgSlug, projectSlug] });
        },
    });
};