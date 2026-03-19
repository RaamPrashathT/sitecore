import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface PhaseItem {
    id: string;
    quantity: number;
    estimatedUnitCost: number;
    itemName: string | undefined;
    unit: string | undefined;
    supplierName: string | undefined;
    truePrice: number | undefined;
    standardRate: number | undefined;
    leadTime: number | undefined;
}

export interface PhaseRequisition {
    id: string;
    budget: number;
    status: string;
    requestedBy: string;
    createdAt: Date;
    items: PhaseItem[];
}

export interface PhaseListType {
    id: string;
    name: string;
    description: string | null;
    budget: number;
    isPaid: boolean;
    paymentDeadline: Date;
    status: string;
    projectId: string;
    requisitions: PhaseRequisition[];
}

const getPhaseList = async (projectId: string | undefined, organizationId: string | undefined) => {
    const {data} = await api.get<PhaseListType[]>("/project/phase", {
        headers: {
            "x-organization-id": organizationId,
            "x-project-id": projectId,
        },
    });
    return data;
};

export const usePhaseList = (projectId: string | undefined, organizationId: string | undefined) => {
    return useQuery({
        queryKey: ["phaseList", projectId, organizationId],
        queryFn: () => getPhaseList(projectId, organizationId),
        enabled: !!projectId && !!organizationId,
        staleTime: 5 * 60 * 1000,
    });
};
