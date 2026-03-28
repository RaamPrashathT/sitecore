import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

interface MemberSchema {
    userId: string;
    name: string;
    role: string;
    phone: string;
    email: string;
    profileImage: string;
}

interface ProjectMembersSchema {
    admins: {
        count: number;
        members: MemberSchema[];
    };
    engineers: {
        count: number;
        members: MemberSchema[];
    };
    clients: {
        count: number;
        members: MemberSchema[];
    };
}

const getProjectMembers = async () => {
    const { data } = await api.get<ProjectMembersSchema>("/project/members");
    return data;
};

export const useProjectMembers = (
    organizationSlug: string | undefined,
    projectSlug: string | undefined,
) => {
    return useQuery({
        queryKey: ["projectMembers", organizationSlug, projectSlug],
        queryFn: getProjectMembers,
        staleTime: 1000 * 60 * 60,
        enabled: !!organizationSlug && !!projectSlug,
    });
};
