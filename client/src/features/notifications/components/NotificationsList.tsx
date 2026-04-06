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
                <Spinner className="text-green-700" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-12 border border-dashed border-gray-200 rounded-xl">
                <Empty
                    title="Error loading notifications"
                />
            </div>
        );
    }

    if (!notifications || notifications.length === 0) {
        return (
            <div className="py-12 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                <Empty
                    title="No notifications"
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col space-y-3">
            {notifications.map((notification) => (
                <NotificationItem
                    key={notification.id}
                    notification={notification}
                />
            ))}
        </div>
    );
};