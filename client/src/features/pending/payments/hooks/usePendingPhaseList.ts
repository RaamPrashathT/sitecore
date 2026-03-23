import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface PendingPhaseListType {
    id: string;
    phaseName: string;
    projectName: string;
    budget: number;
    paymentDeadline: Date;
    client: string;
}

export interface PendingPhaseListSchema {
    data: PendingPhaseListType[];
    count: number;
}

const getPendingPhaseList = async (
    organizationId: string,
    pageIndex: number,
    pageSize: number,
    searchQuery: string = "",
) => {
    const { data } = await api.get<PendingPhaseListSchema>(
        `/project/paymentPendingPhases?index=${pageIndex}&size=${pageSize}&search=${searchQuery}`,
        {
            headers: {
                "x-organization-id": organizationId,
            },
        },
    );
    return data;
};

export const usePendingPhaseList = (
    organizationId: string | undefined,
    pageIndex: number = 0,
    pageSize: number = 10,
    searchQuery: string = "",
) => {
    return useQuery({
        queryKey: ["pendingPayments", organizationId],
        queryFn: () =>
            getPendingPhaseList(
                organizationId!,
                pageIndex,
                pageSize,
                searchQuery,
            ),
        enabled: !!organizationId,
    });
};
