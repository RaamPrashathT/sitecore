import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { RegisterInput } from "@/features/auth/authSchema";

interface RegisterPayload extends Omit<RegisterInput, "confirmPassword"> {
    inviteToken?: string;
}

export const useRegister = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: RegisterPayload) => {
            const response = await api.post("/auth/register", data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["session"] });
        },
    });
};