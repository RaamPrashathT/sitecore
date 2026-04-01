import api from "@/lib/axios";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

export interface SupplierQuotesType {
    id: string;
    supplier: string;
    truePrice: number;
    standardRate: number;
    leadTime: number | null;
    catalogueId: string;
}

export type CatalogueItemType = {
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
    supplierQuotes: SupplierQuotesType[];
    inventory: number;
};

export interface CatalogueInputSchema {
    data: CatalogueItemType[];
    count: number;
}

const getCatalogues = async (
    organizationId: string,
    pageIndex: number,
    pageSize: number,
    searchQuery: string = "",
) => {
    const response = await api.get<CatalogueInputSchema>(
        `/catalogue?index=${pageIndex}&size=${pageSize}&search=${searchQuery}`,
        {
            headers: {
                "x-organization-id": organizationId,
            },
        },
    );
    return response.data;
};

export const useGetCatalogues = (
    organizationId: string | undefined,
    pageIndex: number = 0,
    pageSize: number = 10,
    searchQuery: string = "",
) => {
    return useQuery({
        queryKey: [
            "catalogue",
            organizationId,
            pageIndex,
            pageSize,
            searchQuery,
        ],
        queryFn: () =>
            getCatalogues(organizationId!, pageIndex, pageSize, searchQuery),
        enabled: !!organizationId,
        placeholderData: keepPreviousData,
        select: (catalogueResponse) => {
            const safeData = catalogueResponse.data.map((item) => ({
                ...item,
                supplierQuotes: item.supplierQuotes || [],
            }));

            return {
                count: catalogueResponse.count,
                data: safeData,
            };
        },
    });
};
