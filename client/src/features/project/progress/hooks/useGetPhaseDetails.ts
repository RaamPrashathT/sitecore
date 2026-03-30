import api from "@/lib/axios";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
// import type { PhaseItem } from "../../phase/hooks/usePhaseList"; // Uncomment if needed

export interface PhaseDetailsSchema {
    phaseSnapshot: {
        id: string;
        name: string;
        status: string;
        budget: number;
        spent: number;
        paymentDeadline: string;
        isOverdue: boolean;
    };
    requisitions: Array<{
        id: string;
        status: string;
        budget: number;
        itemsSummary: string;
        items: Array<{
            id: string;
            itemName: string;
            unit: string;
            quantity: number;
            estimatedUnitCost: number;
            supplierName: string;
            standardRate: number;
        }>;
    }>;
    siteLogs: Array<{
        id: string;
        title: string;
        description: string | null;
        workDate: string;
        author: {
            profile: string;
            name: string;
        };
        images: string[];
        commentCount: number;
    }>;
}

// 1. Pass the identifiers into the fetcher function
const getPhaseDetails = async (
    phaseId: string, 
    projectSlug: string, 
    organizationId: string
) => {
    // 2. Attach the strict headers your backend middleware expects
    const response = await api.get<PhaseDetailsSchema>(`/project/phase/${phaseId}/details`, {
        headers: {
            "x-organization-id": organizationId,
            "x-project-slug": projectSlug
        }
    });
    return response.data;
};

// 3. Require the slugs/IDs in the hook arguments
export const useGetPhaseDetails = (
    phaseId: string | undefined,
    projectSlug: string | undefined,
    organizationId: string | undefined
) => {
    return useQuery({
        // 4. Update the QueryKey to create a unique cache bucket for every Org -> Project -> Phase combo
        queryKey: ["phaseDetails", organizationId, projectSlug, phaseId],
        queryFn: () => getPhaseDetails(phaseId!, projectSlug!, organizationId!),
        // 5. Prevent the query from running until ALL three variables exist
        enabled: !!phaseId && !!projectSlug && !!organizationId,
        placeholderData: keepPreviousData,
        select: (data) => {
            const formattedSnapshot = {
                ...data.phaseSnapshot,
                formattedBudget: `₹${(data.phaseSnapshot.budget / 100000).toFixed(1)}L`,
                formattedSpent: `₹${(data.phaseSnapshot.spent / 100000).toFixed(1)}L`,
                progressPercentage: data.phaseSnapshot.budget > 0 
                    ? Math.round((data.phaseSnapshot.spent / data.phaseSnapshot.budget) * 100) 
                    : 0 // Safety check to prevent NaN if budget is 0
            };

            return {
                ...data,
                phaseSnapshot: formattedSnapshot,
                siteLogs: data.siteLogs.sort((a, b) => 
                    new Date(b.workDate).getTime() - new Date(a.workDate).getTime()
                )
            };
        },
    });
};