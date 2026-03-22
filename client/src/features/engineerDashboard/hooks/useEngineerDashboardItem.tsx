import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface EngineerDashboardItem {
    id: string;
    quantity: number;
    estimatedUnitCost: number;
    status: "ORDERED" | "UNORDERED";
    itemName: string;
    unit: string;
    supplierName: string;
}

export interface EngineerDashboardPhase {
    id: string;
    name: string;
    description: string | null;
    budget: number;
    projectName: string;
    items: EngineerDashboardItem[];
}

export interface EngineerDashboardResponse {
    data: EngineerDashboardPhase[];
    count: number;
}


const getDashboardItems = async (
    organizationId: string,
    pageIndex: number,
    pageSize: number,
    searchQuery: string = "",
) => {
    const response = await api.get<EngineerDashboardResponse>(
        `/dashboard/engineer?index=${pageIndex}&size=${pageSize}&search=${searchQuery}`,
        {
            headers: {
                "x-organization-id": organizationId,
            },
        },
    );
    return response.data;
};

export const useGetEngineerDashboardItems = (
    organizationId: string | undefined,
    pageIndex: number = 0,
    pageSize: number = 10,
    searchQuery: string = "",
) => {
    return useQuery({
        queryKey: [
            "dashboardItems",
            organizationId,
            pageIndex,
            pageSize,
            searchQuery,
        ],
        queryFn: () =>
            getDashboardItems(
                organizationId!,
                pageIndex,
                pageSize,
                searchQuery,
            ),
        enabled: !!organizationId,
    });
};
