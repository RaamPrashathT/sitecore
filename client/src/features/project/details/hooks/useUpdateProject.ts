import api from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface UpdateProjectPayload {
    name?: string;
    address?: string;
    estimatedBudget?: number;
    status?: "DRAFT" | "ACTIVE" | "COMPLETED" | "ARCHIVED";
}

export const useUpdateProject = (orgSlug: string, projectSlug: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: UpdateProjectPayload) => {
            console.log("hi")
            const response = await api.put("/project/", data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["projectDetails", orgSlug, projectSlug],
            });
        },
    });
};