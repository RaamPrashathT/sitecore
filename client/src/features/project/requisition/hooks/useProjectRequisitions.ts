import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface RequisitionListItem {
    id: string;
    title: string;
    slug: string;
    status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED";
    budget: number;
    createdAt: string;
    itemsCount: number;
}

export interface PhaseWithRequisitions {
    id: string;
    name: string;
    slug: string;
    status: "PLANNING" | "PAYMENT_PENDING" | "ACTIVE" | "COMPLETED";
    budget: number;
    requisitions: RequisitionListItem[];
}

export const useProjectRequisitions = (orgSlug?: string, projectSlug?: string) => {
    return useQuery({
        queryKey: ["projectRequisitions", orgSlug, projectSlug],
        queryFn: async () => {
            const { data } = await api.get<PhaseWithRequisitions[]>(
                `/project/requisitions`
            );
            return data;
        },
        enabled: !!orgSlug && !!projectSlug,
    });
};