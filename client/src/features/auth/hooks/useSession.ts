import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../stores/authStore";
import api from "@/lib/axios";
import { useEffect } from "react";

export const useSession = () => {
    const login = useAuthStore((state) => state.login);
    const logout = useAuthStore((state) => state.logout);
    
    const query = useQuery({
        queryKey: ['session'],
        queryFn: async () => {
            const response = await api.get("/auth/me");
            return response.data.data;
        },
        retry: false,
        staleTime: 5 * 60 * 1000,
    });

    useEffect(() => {
        if (query.data) login(query.data);
        if (query.isError) logout();
    }, [query.data, query.isError, login, logout]);

    return {
        isLoading: query.isLoading,
        isError: query.isError,
        user: query.data,
    };
};