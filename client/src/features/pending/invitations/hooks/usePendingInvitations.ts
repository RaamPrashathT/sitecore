import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface PendingInvitationType {
    userId: string;
    username: string;
    email: string;
    profileImage?: string;
    role: string;
}

export interface PendingInvitationResponse {
    
    data: PendingInvitationType[];
    totalCount: number;
    totalPages: number;
}

const getPendingInvitations = async (
    organizationId: string,
    pageIndex: number,
    pageSize: number,
    searchQuery: string = "",
) => {
    const { data } = await api.get<PendingInvitationResponse>(
        `/pending/invitations?index=${pageIndex}&size=${pageSize}&search=${searchQuery}`,
        {
            headers: {
                "x-organization-id": organizationId,
            },
        },
    );
    return data;
};

export const usePendingInvitations = (
    organizationId: string | undefined,
    pageIndex: number = 0,
    pageSize: number = 10,
    searchQuery: string = "",
) => {
    return useQuery({
        queryKey: [
            "pendingInvitations",
            organizationId,
            pageIndex,
            pageSize,
            searchQuery,
        ],
        queryFn: () =>
            getPendingInvitations(
                organizationId!,
                pageIndex,
                pageSize,
                searchQuery,
            ),
        enabled: !!organizationId,
    });
};