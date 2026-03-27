import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { OnboardInput } from "../authSchema";

export const useOnboard = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: OnboardInput) => {
            const response = await api.post("/user/onboard", data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["session"] });
        },
    });
};