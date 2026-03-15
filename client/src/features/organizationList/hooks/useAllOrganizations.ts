import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

interface ItemType {
    id: string;
    name: string;
    slug: string;
}

interface OrganizationType {
    items: ItemType[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
}

const getAllOrganizations = async (
    query: string,
    page: number,
    limit: number
) => {
    const { data } = await api.get<OrganizationType>("/org/all", {
        params: { query, page, limit },
    });

    return data;
};

export const useAllOrganizations = (
    query: string,
    page: number,
    limit = 10
) => {
    return useQuery({
        queryKey: ["organizations", query, page],
        queryFn: () => getAllOrganizations(query, page, limit),
    });
};