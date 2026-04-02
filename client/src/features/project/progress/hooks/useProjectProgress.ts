import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface ProjectStats {
    id: string;
    name: string;
    totalBudget: number;
    totalSpent: number;
    activePhasesCount: number;
    overallProgress: number;
}

export interface LatestActivityLog {
    id: string;
    title: string;
    workDate: string;
    authorName: string;
}

export interface PhaseProgress {
    id: string;
    name: string;
    slug: string;
    description: string;
    status: "PLANNING" | "PAYMENT_PENDING" | "ACTIVE" | "COMPLETED";
    startDate: string;
    sequenceOrder: number;
    budget: number;
    spent: number;
    totalLogs: number;
    totalComments: number;
    latestActivity: LatestActivityLog[];
}

export interface ProjectProgressResponse {
    project: ProjectStats;
    phases: PhaseProgress[];
}

export const useProjectProgress = (orgSlug?: string, projectSlug?: string) => {
    return useQuery({
        queryKey: ["projectPhases", orgSlug, projectSlug], 
        queryFn: async () => {
            const { data } = await api.get<ProjectProgressResponse>("/project/phases");
            return data;
        },
        enabled: !!orgSlug && !!projectSlug,
    });
};