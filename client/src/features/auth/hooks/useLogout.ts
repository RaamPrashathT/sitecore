import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../stores/authStore"
import api from "@/lib/axios";

export const useLogout = () => {
    const logout = useAuthStore((state) => state.logout);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => api.post("/auth/logout"),
        onSettled: () => {
            logout();
            queryClient.removeQueries({queryKey: ['session']});
        }
    })
}