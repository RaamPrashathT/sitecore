import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface PendingRequisitionItemType {
    id: string;
    quantity: number;
    estimatedUnitCost: number;
    supplierId: string | undefined;
    supplierName: string | undefined;
    truePrice: number | undefined;
    standardRate: number | undefined;
    itemName: string;
    unit: string;
}

export interface PendingRequisitionData {
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
    items: PendingRequisitionItemType[];
}

export interface PendingRequisitionSchema {
    data: PendingRequisitionData[];
    count: number;
}

const getPendingRequisitionList = async (
    organizationId: string,
    pageIndex: number,
    pageSize: number,
    searchQuery: string = "",
) => {
    const { data } = await api.get<PendingRequisitionSchema>(
        `/project/pendingRequisitions?index=${pageIndex}&size=${pageSize}&search=${searchQuery}`,
        {
            headers: {
                "x-organization-id": organizationId,
            },
        },
    );
    return data;
};

export const usePendingRequisitionList = (
    organizationId: string | undefined,
    pageIndex: number = 0,
    pageSize: number = 10,
    searchQuery: string = "",
) => {
    return useQuery({
        queryKey: ["pendingRequisitions", organizationId],
        queryFn: () =>
            getPendingRequisitionList(
                organizationId!,
                pageIndex,
                pageSize,
                searchQuery,
            ),
        enabled: !!organizationId,
    });
};
