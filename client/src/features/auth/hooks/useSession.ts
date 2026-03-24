import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export const useSession = () => {
    const query = useQuery({
        queryKey: ['session'],
        queryFn: async () => {
            const response =  await api.get("/auth/me");
            return response.data.data
        },
        retry: false,
        staleTime: 5 * 60 * 1000
    })

    return {
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        isError: query.isError,
        user: query.data,
    };
}