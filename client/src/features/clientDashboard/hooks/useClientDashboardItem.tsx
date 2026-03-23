import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface ClientDashboardItem {
    id: string;
    name: string;
    budget: number;
    projectName: string;
    estimatedBudget: number;
    paymentDeadline: Date;
}

interface ClientDashboardResponse {
    data: ClientDashboardItem[];
    count: number;
}

export interface ClientDashboardItemSchema extends ClientDashboardItem {
    daysTillOrder: number;
    status: string;
}

const getDashboardItems = async (
    organizationId: string,
    pageIndex: number,
    pageSize: number,
    searchQuery: string = "",
) => {
    const response = await api.get<ClientDashboardResponse>(
        `/dashboard/Client?index=${pageIndex}&size=${pageSize}&search=${searchQuery}`,
        {
            headers: {
                "x-organization-id": organizationId,
            },
        },
    );
    return response.data;
};

export const useGetClientDashboardItems = (
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
        select: (dashboardItems) => {
            const data = dashboardItems.data.map((item) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const startDate = new Date(item.paymentDeadline);
                const dropDeadDate = new Date(startDate);
                dropDeadDate.setDate(dropDeadDate.getDate());
                const diffTime = dropDeadDate.getTime() - today.getTime();
                const diffDate = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                let status: string;

                if (diffDate <= 3) {
                    status = "URGENT";
                } else if (diffDate <= 7) {
                    status = "DUE";
                } else {
                    status = "UPCOMING";
                }

                return {
                    ...item,
                    daysTillOrder: diffDate,
                    status,
                };
            });
            return {
                count: dashboardItems.count,
                data,
            };
        }
    });
};
