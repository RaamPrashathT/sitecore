import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

interface RequisitionDetailsType {
    id: string;
    budget: number;
    status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED";
    requestedBy: string;
    phaseId: string;
}

const getRequisitionDetails = async (requisitionId: string | undefined, organizationId: string | undefined, projectId: string | undefined) => {
    const response = await api.get<RequisitionDetailsType>(
        `/project/phase/requisition/${requisitionId}`,
        {
            headers: {
                "x-organization-id": organizationId,
                "x-project-id": projectId
            }
        }
    );
    return response.data;
};

export const useRequisitionDetails = (requisitionId: string | undefined, organizationId: string | undefined, projectId: string | undefined) => {
    return useQuery({
        queryKey: ["requisitionDetails", requisitionId, organizationId, projectId],
        queryFn: () => getRequisitionDetails(requisitionId, organizationId, projectId),
        enabled: !!requisitionId && !!organizationId && !!projectId,
    });
};
