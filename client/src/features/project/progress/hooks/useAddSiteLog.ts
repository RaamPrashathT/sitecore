import api from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface SiteLogPayload {
    title: string;
    description?: string;
    workDate: string | Date;
    images: string[]; 
}

export const useAddSiteLog = (orgSlug: string, projectSlug: string, phaseSlug: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: SiteLogPayload) => {
            // Updated endpoint to use the phaseSlug
            const response = await api.post(`/project/phase/${phaseSlug}/sitelog`, data);
            return response.data;
        },
        onSuccess: () => {
            // Invalidate the specific phase details so the new log shows up immediately
            queryClient.invalidateQueries({ 
                queryKey: ["phaseDetails", orgSlug, projectSlug, phaseSlug] 
            });
            // Also invalidate the main phases list to update the total log count
            queryClient.invalidateQueries({ 
                queryKey: ["projectPhases", orgSlug, projectSlug] 
            });
        },
    });
};