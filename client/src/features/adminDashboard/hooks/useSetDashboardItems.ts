import api from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { DashboardItemType } from "./useGetDashboardItems"; 

interface MutationVariables {
    requisitionItemIds: string[];
}

interface DashboardQueryData {
    count: number;
    data: DashboardItemType[];
}

const setDashboardItems = async (requisitionItemIds: string[], organizationId: string | undefined) => {
    const result = await api.post("/dashboard", 
        { requisitionItemIds }, 
        { headers: { "x-organization-id": organizationId } }
    );
    return result.data;
};

export const useSetDashboardItems = (organizationId: string | undefined) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ requisitionItemIds }: MutationVariables) => 
            setDashboardItems(requisitionItemIds, organizationId),
        
        onMutate: async ({ requisitionItemIds }) => {
            await queryClient.cancelQueries({ queryKey: ['dashboardItems', organizationId] });

            queryClient.setQueriesData<DashboardQueryData>(
                { queryKey: ['dashboardItems', organizationId] },
                (oldData) => {
                    if (!oldData) return undefined; 
                    
                    return {
                        ...oldData,
                        data: oldData.data.filter((item) => !requisitionItemIds.includes(item.id)),
                        count: Math.max(0, oldData.count - requisitionItemIds.length)
                    };
                }
            );
        },
        
        onError: () => {
            queryClient.invalidateQueries({ queryKey: ['dashboardItems', organizationId] });
        },
        
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['dashboardItems', organizationId] });
        },
    });
};