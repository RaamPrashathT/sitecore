import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface RequisitionItemDetail {
    id: string;
    itemName: string;
    category: "MATERIALS" | "LABOUR" | "EQUIPMENT" | "SUBCONTRACTORS" | "TRANSPORT" | "OVERHEAD";
    unit: string;
    quantity: number;
    estimatedUnitCost: number;
    totalEstimatedCost: number;
    status: "ORDERED" | "UNORDERED";
    supplierName: string;
    standardRate: number | null;
}

export interface RequisitionDetailsResponse {
    id: string;
    title: string;
    slug: string;
    status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED";
    budget: number;
    createdAt: string;
    phase: {
        name: string;
        slug: string;
    };
    items: RequisitionItemDetail[];
}

export const useRequisitionDetails = (
    orgSlug?: string, 
    projectSlug?: string, 
    phaseSlug?: string, 
    requisitionSlug?: string
) => {
    return useQuery({
        queryKey: ["requisitionDetails", orgSlug, projectSlug, phaseSlug, requisitionSlug],
        queryFn: async () => {
            const { data } = await api.get<RequisitionDetailsResponse>(
                `/project/phase/${phaseSlug}/requisition/${requisitionSlug}`
            );
            return data;
        },
        enabled: !!orgSlug && !!projectSlug && !!phaseSlug && !!requisitionSlug,
    });
};