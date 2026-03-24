import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface EngineerType {
    id: string;
    username: string;
    email: string;
    profileImage: string;
}

export interface EngineerSchema {
    data: EngineerType[];
    totalCount: number;
    totalPages: number;
}

const getEngineers = async (
    organizationId: string,
    pageIndex: number,
    pageSize: number,
    searchQuery: string,
) => {
    const { data } = await api.get<EngineerSchema>(
        `/engineers?index=${pageIndex}&size=${pageSize}&search=${searchQuery}`,
        {
            headers: {
                "x-organization-id": organizationId,
            },
        },
    );
    return data;
};

export const useEngineers = (
    organizationId: string | undefined,
    pageIndex: number,
    pageSize: number,
    searchQuery: string = "",
) => {
    return useQuery({
        queryKey: ["engineers", organizationId, pageIndex, pageSize, searchQuery],
        queryFn: () =>
            getEngineers(organizationId!, pageIndex, pageSize, searchQuery),
        enabled: !!organizationId,
    });
};
