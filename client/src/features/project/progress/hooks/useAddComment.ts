import api from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface CommentPayload {
    text: string;
    imageId?: string | null; // Optional reference!
}

export const useAddComment = (orgSlug: string, projectSlug: string, phaseSlug: string, sitelogId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CommentPayload) => {
            const response = await api.post(`/project/sitelog/${sitelogId}/comment`, data);
            return response.data;
        },
        onSuccess: () => {
            // Invalidate the phase details so the new comment instantly appears
            queryClient.invalidateQueries({ 
                queryKey: ["phaseDetails", orgSlug, projectSlug, phaseSlug] 
            });
        },
    });
};