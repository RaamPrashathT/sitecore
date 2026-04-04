import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export type CatalogueWithQuotes = {
    id: string;
    name: string;
    category:
        | "MATERIALS"
        | "LABOUR"
        | "EQUIPMENT"
        | "SUBCONTRACTORS"
        | "TRANSPORT"
        | "OVERHEAD";
    unit: string;
    defaultLeadTime: number;
    organizationId: string;
    supplierQuotes: {
        id: string;
        supplier: string;
        standardRate: number;
        leadTime: number | null;
        catalogueId: string;
    }[];
};

export type RequisitionCataloguePayload = {
    phase: {
        id: string;
        name: string;
        budget: number;
        remainingBudget: number;
    };
    catalogue: {
        data: CatalogueWithQuotes[];
        count: number;
    };
};

export const useGetRequisitionCatalogue = (
    phaseSlug?: string,
    pageIndex: number = 0,
    pageSize: number = 24,
    searchQuery: string = ""
) => {
    return useQuery({
        queryKey: ["requisitionCatalogue", phaseSlug, pageIndex, pageSize, searchQuery],
        queryFn: async () => {
            const { data } = await api.get<RequisitionCataloguePayload>(
                `/project/phase/${phaseSlug}/requisition-catalogue`,
                {
                    params: {
                        index: pageIndex,
                        size: pageSize,
                        search: searchQuery,
                    },
                }
            );
            return data;
        },
        enabled: !!phaseSlug,
    });
};