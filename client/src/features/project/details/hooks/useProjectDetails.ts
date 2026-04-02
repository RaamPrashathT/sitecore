import api from "@/lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface ProjectDetails {
    id: string;
    name: string;
    slug: string;
    address: string;
    status: string;
    budgets: {
        estimatedTotal: number;
        consumed: number;
        remaining: number;
    };
    phases: {
        id: string;
        name: string;
        status: string;
    }[];
    recentSiteLogs: {
        id: string;
        title: string;
        workDate: string;
        authorName: string;
    }[];
}

export const useProjectDetails = (orgSlug?: string, projectSlug?: string) => {
    return useQuery({
        queryKey: ["projectDetails", orgSlug, projectSlug],
        queryFn: async () => {
            const { data } = await api.get<ProjectDetails>("/project/details");
            return data;
        },
        enabled: !!orgSlug && !!projectSlug, 
    });
};

export const useDeleteProject = (orgSlug?: string, projectSlug?: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            await api.delete("/project/");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects", orgSlug] });
        }
    });
};