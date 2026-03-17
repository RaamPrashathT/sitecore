import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface DashboardItemType {
    id: string;
    quantity: number;
    estimatedUnitCost: number;
    itemName: string;
    unit: string;
    supplierName: string | undefined;
    leadTime: number;
    truePrice: number | undefined;
    standardRate: number | undefined;
    projectid: string;
    projectName: string;
    phaseName: string;
    phaseStartDate: Date;
}

const getDashboardItems = async (organizationId: string) => {

    const response = await api.get<DashboardItemType[]>("/dashboard", 
        {
            headers: {
                "x-organization-id": organizationId
            }
        }
    )
    return response.data;
} 

export const useGetDashboardItems = (organizationId: string | undefined) => {
    return useQuery({
        queryKey: ['dashboardItems', organizationId],
        queryFn: () => getDashboardItems(organizationId!), 
        enabled: !!organizationId
    })
}