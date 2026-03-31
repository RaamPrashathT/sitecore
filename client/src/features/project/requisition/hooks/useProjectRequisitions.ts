import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface RequisitionItem {
    id: string;
    itemName: string;
    unit: string;
    quantity: number;
    estimatedUnitCost: number;
    status: "UNORDERED" | "ORDERED";
    supplierName: string;
    standardRate: number;
}

export interface Requisition {
    id: string;
    status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED";
    budget: number;
    itemsSummary: string;
    items: RequisitionItem[];
}

export interface PhaseWithRequisitions {
    id: string;
    name: string;
    status: string;
    budget: number;
    requisitions: Requisition[];
}

export const useProjectRequisitions = (orgSlug?: string, projectSlug?: string) => {
    return useQuery({
        queryKey: ["projectRequisitions", orgSlug, projectSlug],
        queryFn: async () => {
            const { data } = await api.get<PhaseWithRequisitions[]>("/project/requisitions");
            return data;
        },
        enabled: !!orgSlug && !!projectSlug,
    });
};