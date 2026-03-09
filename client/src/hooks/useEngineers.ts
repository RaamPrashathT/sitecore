import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface EngineerType {
    id : string;
    username: string;
    email: string;
    profileImage: string;
}

const getEngineers = async (organizationId: string) => {

    const response = await api.get<EngineerType[]>("/engineers", 
        {
            headers: {
                "x-organization-id": organizationId
            }
        }
    )
    return response.data;
} 

export const useEngineers = (organizationId: string | undefined) => {
    return useQuery({
        queryKey: ['engineers', organizationId],
        queryFn: () => getEngineers(organizationId!), 
        enabled: !!organizationId
    })
}