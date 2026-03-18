import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../stores/authStore"
import api from "@/lib/axios";
import { useNavigate } from "react-router-dom";

export const useLogout = () => {
    const logout = useAuthStore((state) => state.logout);
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    
    const handleLogout = async () => {
        await api.post("/auth/logout")
        navigate("/login")
    }

    return useMutation({
        mutationFn: () => handleLogout(),
        onSettled: () => {
            logout();
            queryClient.removeQueries({queryKey: ['session']});
        }
    })
}