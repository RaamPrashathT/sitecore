import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

interface DeclineInvitationPayload {
    token: string;
}

export const useDeclineInvitation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: DeclineInvitationPayload) => {
            const response = await api.post("/user/decline-invitation", data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invitation"] });
        },
    });
};