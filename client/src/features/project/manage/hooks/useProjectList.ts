import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export interface ProjectListType {
    id: string;
    name: string;
    slug: string;
    estimatedBudget: number;
    phases: number;
    assignments: number;
}

export interface PaginatedProjectResponse {
    data: ProjectListType[];
    count: number;
}

const getAllProjects = async (
    organizationId: string | undefined,
    pageIndex: number,
    pageSize: number,
    searchQuery: string,
) => {
    console.log(organizationId, pageIndex, pageSize, searchQuery)
    const { data } = await api.get<PaginatedProjectResponse>(
        
        `/project?index=${pageIndex}&size=${pageSize}&search=${searchQuery}`,
        {
            headers: {
                "x-organization-id": organizationId,
            },
        },
    );
    return data;
};

export const useProjectList = (
    organizationId: string | undefined,
    pageIndex: number = 0,
    pageSize: number = 10,
    searchQuery: string = "",
) => {
    return useQuery({
        queryKey: [
            "projectList",
            organizationId,
            pageIndex,
            pageSize,
            searchQuery,
        ],
        queryFn: () =>
            getAllProjects(organizationId, pageIndex, pageSize, searchQuery),
        enabled: !!organizationId,
    });
};