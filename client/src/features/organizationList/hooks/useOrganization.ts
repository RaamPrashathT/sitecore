import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

interface OrganizationType {
    id: string;
    name: string;
    slug: string;
    role: "ADMIN" | "ENGINEER" | "CLIENT";
}
const getOrganizations = async () => {
    const { data } = await api.get<OrganizationType[]>("/org");
    return data;
};

export const useOrganizations = () => {
    return useQuery({
        queryKey: ["organizations"],
        queryFn: getOrganizations,
    })
}