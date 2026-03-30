import api from "@/lib/axios";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

export interface PhaseTimelineItem {
    id: string;
    name: string;
    status: "PLANNING" | "PAYMENT_PENDING" | "ACTIVE" | "COMPLETED";
    startDate: string;
    sequenceOrder: number;
}

export interface ProjectProgressSchema {
    project: {
        id: string;
        name: string;
        totalBudget: number;
        totalSpent: number;
        overallProgress: number;
    };
    phases: PhaseTimelineItem[];
}

const getProjectProgress = async () => {
    const response = await api.get<ProjectProgressSchema>("/project/phases");
    console.log(response.data);
    return response.data;
};

export const useGetProjectProgress = () => {
    return useQuery({
        queryKey: ["projectProgress"],
        queryFn: getProjectProgress,
        placeholderData: keepPreviousData,
        select: (data) => {
            const sortedPhases = [...data.phases].sort((a, b) => a.sequenceOrder - b.sequenceOrder);
            
            return {
                ...data,
                phases: sortedPhases
            };
        },
    });
};