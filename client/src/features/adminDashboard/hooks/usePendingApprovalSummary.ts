import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface PendingPaymentType {
    id: string;
    title: string;
    projectName: string;
    slug: string;
    amount: number;
    type: "VENDOR_PAYMENT";
}

export interface PendingRequisitionType {
    id: string;
    title: string;
    phaseName: string;
    slug: string;
    amount: number;
    requestedBy: string;
    type: "MATERIAL_ORDER";
}

export interface PendingApprovalsSummary {
    pendingPayments: PendingPaymentType[];
    pendingRequisitions: PendingRequisitionType[];
}

const getPendingApprovalsSummary = async (organizationId: string) => {
    const response = await api.get<PendingApprovalsSummary>(
        `/dashboard/pending-approvals`,
        { headers: { "x-organization-id": organizationId } }
    );
    return response.data;
};

export const usePendingApprovalsSummary = (organizationId: string | undefined) => {
    return useQuery({
        queryKey: ["pendingApprovalsSummary", organizationId],
        queryFn: () => getPendingApprovalsSummary(organizationId!),
        enabled: !!organizationId,
    });
};