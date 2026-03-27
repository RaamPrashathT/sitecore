import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { LoginInput } from "@/features/auth/authSchema";

interface LoginPayload extends LoginInput {
    inviteToken?: string;
}

export const useLogin = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: LoginPayload) => {
            const response = await api.post("/auth/login", data);
            console.log(response.data)
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["session"] });  
        },
    });
};