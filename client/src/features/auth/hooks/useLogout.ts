import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useNavigate } from "react-router-dom";

export const useLogout = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: () => api.post("/auth/logout"),
        onSettled: () => {
            queryClient.clear()
            navigate("/login");
        }
    });
}