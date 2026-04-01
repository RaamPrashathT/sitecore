import { Spinner } from "@/components/ui/spinner";
import { Empty } from "@/components/ui/empty";
import { NotificationItem } from "./NotificationItem";
import type { NotificationSchema } from "../hooks/useGetNotifications";

interface NotificationsListProps {
    notifications: NotificationSchema[] | undefined;
    isLoading: boolean;
    error: Error | null;
}

export const NotificationsList = ({
    notifications,
    isLoading,
    error,
}: NotificationsListProps) => {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Spinner />
            </div>
        );
    }

    if (error) {
        return (
            <Empty
                title="Error loading notifications"
                description="Something went wrong. Please try again."
            />
        );
    }

    if (!notifications || notifications.length === 0) {
        return (
            <Empty
                title="No notifications"
                description="You're all caught up!"
            />
        );
    }

    return (
        <div className="space-y-3">
            {notifications.map((notification) => (
                <NotificationItem
                    key={notification.id}
                    notification={notification}
                />
            ))}
        </div>
    );
};
