import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export interface OrganizationType {
    id: string;
    name: string;
    slug: string;
    role: "ADMIN" | "ENGINEER" | "CLIENT";
}
const getOrganizations = async () => {
    const { data } = await api.get<OrganizationType[]>("/org");
    return data;
};

export const useOrganizations = (userId: string | undefined) => {
    return useQuery({
        queryKey: ["organizations", userId],
        queryFn: getOrganizations,
        staleTime: 1000 * 60 * 60,
        enabled: !!userId,
    })
}