import api from "@/lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface TimelineComment {
    id: string;
    text: string;
    createdAt: string;
    author: {
        name: string;
        profile: string | null;
    };
}

export interface TimelineImage {
    id: string;
    url: string;
    comments: TimelineComment[];
}

export interface TimelineLog {
    id: string;
    title: string;
    description: string;
    workDate: string;
    author: {
        name: string;
        profile: string | null;
    };
    images: TimelineImage[];
    imageCount: number;
    commentCount: number;
}

export interface TimelinePhase {
    id: string;
    name: string;
    description: string | null;
    budget: number;
    status: "PLANNING" | "PAYMENT_PENDING" | "ACTIVE" | "COMPLETED";
    startDate: string;
    siteLogs: TimelineLog[];
}

export const useProjectProgress = (orgSlug?: string, projectSlug?: string) => {
    return useQuery({
        queryKey: ["projectTimeline", orgSlug, projectSlug],
        queryFn: async () => {
            const { data } = await api.get<TimelinePhase[]>("/project/timeline");
            return data;
        },
        enabled: !!orgSlug && !!projectSlug,
    });
};

// Mutation Hook for posting comments
export const useAddComment = (orgSlug?: string, projectSlug?: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ imageId, text }: { imageId: string; text: string }) => {
            const { data } = await api.post(`/project/image/${imageId}/comment`, { text });
            return data;
        },
        onSuccess: () => {
            // Refetch the timeline to show the new comment instantly
            queryClient.invalidateQueries({ queryKey: ["projectTimeline", orgSlug, projectSlug] });
        },
    });
};