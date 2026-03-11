import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export interface ProjectListType {
    id: string;
    name: string;
    slug: string 
}

const getAllProjects = async (organizationId: string | undefined) => {
    const { data } = await api.get<ProjectListType[]>("/project", 
        {
            headers: {
                "x-organization-id": organizationId
            }
        }
    );
    return data;
}

export const useProjectList = (organizationId: string | undefined) => {

    return useQuery({
        queryKey: ["projectList", organizationId],
        queryFn: () => getAllProjects(organizationId),
        enabled: !!organizationId,
    })
}