import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface InvitationDetails {
    organization: {
        id: string;
        name: string;
    };
    projects: {
        name: string;
        id: string;
    }[];
    admins: {
        userId: string;
        username: string | null;
        profileImage: string | null;
    }[];
    currentUser: string | null;
    sessionState: string;
    userExists: boolean;
    invitedEmail: string;
}

export const useInvitationDetails = (token: string | null) => {
    return useQuery({
        queryKey: ["invitation", token],
        queryFn: async () => {
            const response = await api.get<InvitationDetails>(
                `/clients/invitation-details?token=${token}`,
            );
            return response.data;
        },
        enabled: !!token,
        staleTime: 1000 * 60 * 5,
    });
};
