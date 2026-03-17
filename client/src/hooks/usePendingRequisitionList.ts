import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface PendingRequisitionListType {
    id: string;
    budget: number;
    status: "PENDING_APPROVAL";
    phaseId: string;
    createdAt: Date;
    projectName: string;
    phaseName: string;
    engineer: {
        id: string;
        name: string;
        image: string | null;
    };
    items: {
        id: string;
        quantity: number;
        estimatedUnitCost: number;
        supplierId: string | undefined;
        supplierName: string | undefined;
        truePrice: number | undefined;
        standardRate: number | undefined;
        itemName: string;
        unit: string;
    }[];
}

const getPendingRequisitionList = async (organizationId: string | undefined) => {
    const {data} = await api.get<PendingRequisitionListType[]>(`/project/pendingRequisitions`, {
        headers: {
            "x-organization-id": organizationId,
        },
    });
    return data;
};

export const usePendingRequisitionList = ( organizationId: string | undefined) => {
    return useQuery({
        queryKey: ["pendingRequisitionList", organizationId],
        queryFn: () => getPendingRequisitionList(organizationId),
        enabled: !!organizationId,
    });
};