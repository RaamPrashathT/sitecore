import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

interface ProvisionResponse {
    onboarded: boolean;
    redirectTo: string;
}

export const useProvision = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const response = await api.get<ProvisionResponse>("/user/provision");
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["session"] });
        },
    });
};