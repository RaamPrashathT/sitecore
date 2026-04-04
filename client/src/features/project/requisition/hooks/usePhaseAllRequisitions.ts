import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface RequisitionItemDetail {
    id: string;
    itemName: string;
    category: string;
    unit: string;
    quantity: number;
    estimatedUnitCost: number;
    totalEstimatedCost: number;
    status: string;
    supplierName: string;
    standardRate: number | null;
}

export interface PhaseAllRequisitionsResponse {
    id: string;
    name: string;
    slug: string;
    requisitions: {
        id: string;
        title: string;
        slug: string;
        status: string;
        budget: number;
        createdAt: string;
        items: RequisitionItemDetail[];
    }[];
}

export const usePhaseAllRequisitions = (
    orgSlug?: string,
    projectSlug?: string,
    phaseSlug?: string
) => {
    return useQuery({
        queryKey: ["phaseAllRequisitions", orgSlug, projectSlug, phaseSlug],
        queryFn: async () => {
            const { data } = await api.get<PhaseAllRequisitionsResponse>(
                `/project/phase/${phaseSlug}/all-requisitions`
            );
            return data;
        },
        enabled: !!orgSlug && !!projectSlug && !!phaseSlug,
    });
};