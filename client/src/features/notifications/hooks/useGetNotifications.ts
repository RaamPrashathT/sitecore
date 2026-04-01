import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface NotificationSchema {
    id: string;
    membershipId: string;
    notificationId: string;
    isRead: boolean;
    notification: {
        id: string;
        type: string;
        title: string;
        body: string;
        entityType: string;
        entityId: string;
        projectId: string | null;
        orgId: string;
        createdAt: string;
    };
}

const getNotifications = async () => {
    const response = await api.get<NotificationSchema[]>(
        "/org/notifications"
    );
    return response.data;
};

export const useGetNotifications = () => {
    return useQuery({
        queryKey: ["notifications"],
        queryFn: getNotifications,
        refetchInterval: 30000, 
    });
};
