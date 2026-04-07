import api from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { DashboardItemType } from "./useGetDashboardItems"; 

interface MutationVariables {
    requisitionItemId: string;
    deductInventoryQty: number;
}

const orderDashboardItem = async (variables: MutationVariables, organizationId: string | undefined) => {
    const result = await api.post("/dashboard", 
        variables, 
        { headers: { "x-organization-id": organizationId } }
    );
    return result.data;
};

export const useOrderDashboardItem = (organizationId: string | undefined) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (variables: MutationVariables) => 
            orderDashboardItem(variables, organizationId),
        
        onMutate: async ({ requisitionItemId }) => {
            await queryClient.cancelQueries({ queryKey: ['dashboardItems', organizationId] });

            const previousData = queryClient.getQueryData<{ count: number; data: DashboardItemType[] }>(
                ['dashboardItems', organizationId]
            );

            queryClient.setQueryData<{ count: number; data: DashboardItemType[] }>(
                ['dashboardItems', organizationId],
                (oldData) => {
                    if (!oldData) return undefined; 
                    return {
                        ...oldData,
                        data: oldData.data.filter((item) => item.id !== requisitionItemId),
                        count: Math.max(0, oldData.count - 1)
                    };
                }
            );

            return { previousData };
        },
        
        onError: (_err, _newTodo, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(['dashboardItems', organizationId], context.previousData);
            }
        },
        
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['dashboardItems', organizationId] });
        },
    });
};