import api from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { OrganizationType } from "./useOrganization";

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
        console.log(data)
        return data;
    } catch (error) {
        if (axios.isAxiosError<{ message: string }>(error)) {
            throw new Error(error.response?.data?.message ?? "Request failed");
        } else {
            throw new Error("Something went wrong");
        }
    }
};

export const useCreateOrganization = (userId: string | undefined) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createOrganization,
        onMutate: async (name) => {
            await queryClient.cancelQueries({
                queryKey: ["organizations", userId],
            });
            const previousData = queryClient.getQueryData<OrganizationType[]>([
                "organizations",
                userId,
            ]);

            const tempOrg: OrganizationType = {
                id: "temp-" + crypto.randomUUID(),
                name,
                slug: "loading",
                role: "ADMIN",
            };

            queryClient.setQueryData(
                ["organizations", userId],
                (old: OrganizationType[] = []) => [tempOrg, ...old],
            );

            return { previousData };
        },
        onError: (_error, _variables, context) => {
            if (context?.previousData !== undefined) {
                queryClient.setQueryData(
                    ["organizations", userId],
                    context.previousData,
                );
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ["organizations", userId],
            });
        },
    });
};
