import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface PhaseListType {
    projectId: string;
    name: string;
    description: string | null;
    budget: number;
    isPaid: boolean;
    id: string;
    paymentDeadline: Date;
    status: string;
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
    });
};
