import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

interface AcceptInvitationPayload {
    token: string;
}

export const useAcceptInvitation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: AcceptInvitationPayload) => {
            const response = await api.post("/user/accept-invitation", data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["session"] });
        },
    });
};