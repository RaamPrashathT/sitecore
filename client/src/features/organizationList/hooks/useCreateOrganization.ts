import api from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface CreateOrgResponse {
    id: string;
    name: string;
    slug: string;
    role: string;
}

const createOrganization = async (name: string) => {
    try {
        const { data } = await api.post<CreateOrgResponse>("/org", {
            name,
        });
        return data;
    } catch (error) {
        if (axios.isAxiosError<{ message: string }>(error)) {
            throw new Error(error.response?.data?.message ?? "Request failed");
        } else {
            throw new Error("Something went wrong");
        }
    }
};

export const useCreateOrganization = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createOrganization,
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["organizations"] }),
                queryClient.invalidateQueries({ queryKey: ["session"] }),
            ]);
        },
        onError: (error) => {
            console.log(error);
        },
    });
};
