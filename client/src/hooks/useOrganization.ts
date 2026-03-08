import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

interface MembershipType {
    id: string;
    name: string;
    slug: string;
    role: "ADMIN" | "ENGINEER" | "CLIENT";
}
const getOrganizations = async () => {
    const { data } = await api.get<MembershipType[]>("/org");
    return data;
};

export const useOrganizations = () => {
    return useQuery({
        queryKey: ["organization"],
        queryFn: getOrganizations,
    })
}