import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface DashboardItemSchema {
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
    phaseStartDate: string;
}

export interface DashboardItemInputSchema {
    data: DashboardItemSchema[];
    count: number;
}

export interface DashboardItemType extends DashboardItemSchema {
    daysTillOrder: number;
    status: string;
}

const getDashboardItems = async (organizationId: string, pageIndex: number, pageSize: number) => {
    const response = await api.get<DashboardItemInputSchema>(`/dashboard?index=${pageIndex}&size=${pageSize}`, {
        headers: {
            "x-organization-id": organizationId,
        },
    });
    return response.data;
};

export const useGetDashboardItems = (organizationId: string | undefined, pageIndex: number = 0, pageSize: number = 10) => {
    return useQuery({
        queryKey: ["dashboardItems", organizationId, pageIndex, pageSize],
        queryFn: () => getDashboardItems(organizationId!, pageIndex, pageSize),
        enabled: !!organizationId,
        select: (dashboardItems) => {
            const data = dashboardItems.data.map((item) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const startDate = new Date(item.phaseStartDate);
                const dropDeadDate = new Date(startDate);
                dropDeadDate.setDate(dropDeadDate.getDate() - item.leadTime);
                const diffTime = dropDeadDate.getTime() - today.getTime();
                const diffDate = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                let status: string;
                if (diffDate <= 3) {
                    status = "URGENT";
                } else if (diffDate <= 7) {
                    status = "DUE"
                } else {
                    status = "UPCOMING"
                }

                return {
                    ...item,
                    daysTillOrder: diffDate,
                    status,
                }
            });

            return {
                count: dashboardItems.count,
                data,
            }
        },
    });
};
