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
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['dashboardItems', organizationId] });

            // Snapshot the previous value
            const previousData = queryClient.getQueryData<{ count: number; data: DashboardItemType[] }>(
                ['dashboardItems', organizationId]
            );

            // Optimistically update to the new value
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

            // Return a context object with the snapshotted value
            return { previousData };
        },
        
        onError: (_err, _newTodo, context) => {
            // If the mutation fails, roll back to the previous value
            if (context?.previousData) {
                queryClient.setQueryData(['dashboardItems', organizationId], context.previousData);
            }
        },
        
        onSettled: () => {
            // Always refetch after error or success to ensure backend sync
            queryClient.invalidateQueries({ queryKey: ['dashboardItems', organizationId] });
        },
    });
};