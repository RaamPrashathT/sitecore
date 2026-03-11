import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useParams } from "react-router-dom";

interface MembershipType {
    id: string;
    name: string;
    slug: string;
    role: "ADMIN" | "ENGINEER" | "CLIENT";
}

export const useMembership = () => {
    const { orgSlug } = useParams();

    return useQuery({
        queryKey: ["membership", orgSlug],
        queryFn: async () => {
            const response = await api.post("/org/identity", {
                slug: orgSlug,
            });
            return response.data as MembershipType;
        },
        enabled: !!orgSlug, 
    });
};
