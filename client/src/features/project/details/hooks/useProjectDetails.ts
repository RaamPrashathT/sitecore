import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface ProjectDetails {
    id: string;
    name: string;
    slug: string;
    address: string;
    status: "DRAFT" | "ACTIVE" | "COMPLETED" | "ARCHIVED";
    budgets: {
        estimatedTotal: number;
        consumed: number;
        remaining: number;
    };
    phasePipeline: {
        PLANNING: number;
        PAYMENT_PENDING: number;
        ACTIVE: number;
        COMPLETED: number;
    };
}

const getProjectDetails = async () => {
    const { data } = await api.get<ProjectDetails>("/project/details");
    return data;
};

export const useProjectDetails = (
    organizationSlug: string | undefined,
    projectSlug: string | undefined,
) => {
    return useQuery({
        queryKey: ["projectDetails", organizationSlug, projectSlug],
        queryFn: getProjectDetails,
        staleTime: 1000 * 60 * 5,
        enabled: !!organizationSlug && !!projectSlug, 
    });
};