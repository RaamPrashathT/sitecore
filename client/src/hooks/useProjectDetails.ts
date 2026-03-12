import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export interface ProjectDetailsType {
    id: string ;
    name: string ;
    slug: string ;
    address: string ;
    estimatedBudget: number 
}

const getProjectDetails = async (projectSlug: string | undefined, organizationId: string | undefined) => {
    const { data } = await api.get<ProjectDetailsType>(`project/${projectSlug}`, 
        {
            headers: {
                "x-organization-id": organizationId
            }
        }
    );
    return data;
};

export const useProjectDetails = (projectSlug: string | undefined, organizationId: string | undefined) => {
    return useQuery({
        queryKey: ["projects", organizationId, projectSlug],
        queryFn: () => getProjectDetails(projectSlug, organizationId),
        enabled: !!projectSlug && !!organizationId,
    })
}