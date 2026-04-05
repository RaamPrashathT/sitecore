import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface RequisitionItemDetail {
    id: string;
    itemName: string;
    unit: string;
    quantity: number;
    estimatedUnitCost: number;
    status: string;
    supplierName?: string;
    truePrice?: number;
    standardRate?: number;
}

export interface RequisitionDetail {
    id: string;
    title: string;
    slug: string;
    status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED";
    budget: number;
    requestedBy: string;
    createdAt: string;
    phaseName: string;
    projectName: string;
    items: RequisitionItemDetail[];
}

const getRequisitionBySlug = async (organizationId: string, reqSlug: string) => {
    const { data } = await api.get<RequisitionDetail>(
        `/dashboard/requisition/slug/${reqSlug}`,
        { headers: { "x-organization-id": organizationId } }
    );
    return data;
};

export const useGetRequisitionBySlug = (
    organizationId: string | undefined, 
    reqSlug: string | undefined
) => {
    return useQuery({
        queryKey: ["requisitionDetail", organizationId, reqSlug],
        queryFn: () => getRequisitionBySlug(organizationId!, reqSlug!),
        // Only run the query if we have both the org ID and the slug from the URL
        enabled: !!organizationId && !!reqSlug, 
    });
};