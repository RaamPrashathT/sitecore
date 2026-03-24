import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface ClientType {
    id : string;
    username: string;
    email: string;
    profileImage: string;
}
export interface ClientSchema {
    data: ClientType[];
    totalCount: number;
    totalPages: number;
}

const getClients = async (organizationId: string, pageIndex: number, pageSize: number, searchQuery: string) => {

    const response = await api.get<ClientSchema>(`/clients?index=${pageIndex}&size=${pageSize}&search=${searchQuery}`, 
        {
            headers: {
                "x-organization-id": organizationId
            }
        }
    )
    return response.data;
} 

export const useClients = (
    organizationId: string | undefined,
    pageIndex: number,
    pageSize: number,
    searchQuery: string = "",
) => {
    return useQuery({
        queryKey: ['clients', organizationId, pageIndex, pageSize, searchQuery],
        queryFn: () => getClients(organizationId!, pageIndex, pageSize, searchQuery), 
        enabled: !!organizationId
    })
}