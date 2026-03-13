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

const getPendingPhaseList = async (organizationId: string | undefined) => {
    const {data} = await api.get<PendingPhaseListType[]>(`/project/paymentPendingPhases`, {
        headers: {
            "x-organization-id": organizationId,
        },
    });
    return data;
};

export const usePendingPhaseList = ( organizationId: string | undefined) => {
    return useQuery({
        queryKey: ["pendingPhaseList", organizationId],
        queryFn: () => getPendingPhaseList(organizationId),
        enabled: !!organizationId,
    });
};