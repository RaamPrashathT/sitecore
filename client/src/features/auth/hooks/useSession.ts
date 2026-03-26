import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { sessionSchema } from "../authSchema";

export const useSession = () => {
    const query = useQuery({
        queryKey: ['session'],
        queryFn: async () => {
            const response =  await api.get("/auth/me");
            const validatedData = sessionSchema.safeParse(response.data.data);
            if (!validatedData.success) {
                throw new Error("Invalid session data");
            }
            return validatedData.data
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