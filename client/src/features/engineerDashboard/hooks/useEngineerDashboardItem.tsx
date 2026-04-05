import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

// --- Interfaces Mapping to the Backend ---

export interface ActiveProject {
    id: string;
    name: string;
    slug: string;
    activePhase: {
        name: string;
        deadline: string | null;
    } | null;
}

export interface ActionablePhase {
    phaseId: string;
    phaseName: string;
    projectName: string;
    projectSlug: string;
    phaseSlug: string;
}

export interface RecentRequisition {
    id: string;
    title: string;
    status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED"; // Add your exact statuses here
    createdAt: string;
    slug: string;
    phaseName: string;
    projectName: string;
}

export interface LogComment {
    id: string;
    text: string;
    createdAt: string;
}

export interface RecentLog {
    id: string;
    title: string;
    createdAt: string;
    phaseName: string;
    projectName: string;
    comments: LogComment[];
}

export interface EngineerDashboardResponse {
    activeProjects: ActiveProject[];
    actionablePhases: ActionablePhase[];
    recentRequisitions: RecentRequisition[];
    recentLogs: RecentLog[];
}

// --- Fetcher ---

const getEngineerDashboardItems = async () => {
    // Interceptor handles the tenant slug automatically!
    const response = await api.get<EngineerDashboardResponse>(`/dashboard/engineer`);
    return response.data;
};

// --- Hook ---

export const useGetEngineerDashboardItems = () => {
    return useQuery({
        queryKey: ["engineerDashboardItems"],
        queryFn: getEngineerDashboardItems,
    });
};