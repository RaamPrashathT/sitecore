import api from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query"

interface MutationVariables {
    requisitionItemIds: string[];
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
        
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dashboardItems', organizationId] });
        },
    });
};