import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface ClientType {
    id : string;
    username: string;
    email: string;
    profileImage: string;
}

const getClients = async (organizationId: string) => {

    const response = await api.get<ClientType[]>("/clients", 
        {
            headers: {
                "x-organization-id": organizationId
            }
        }
    )
    return response.data;
} 

export const useClients = (organizationId: string | undefined) => {
    return useQuery({
        queryKey: ['clients', organizationId],
        queryFn: () => getClients(organizationId!), 
        enabled: !!organizationId
    })
}