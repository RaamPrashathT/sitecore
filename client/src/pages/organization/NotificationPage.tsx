import { useGetNotifications } from "@/features/notifications/hooks/useGetNotifications";
import { NotificationsList } from "@/features/notifications/components/NotificationsList";

export default function NotificationPage() {
    const { data: notifications, isLoading, error } = useGetNotifications();

    const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

    return (
        <div className="flex-1 flex flex-col bg-gray-50/30 min-h-full">
            <div className="w-full max-w-3xl mx-auto px-4 py-6 md:px-6 md:py-10">
                
                {/* Header Section */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl md:text-3xl font-display text-gray-900 tracking-tight">
                            Notifications
                        </h1>
                    </div>

                </div>

                {/* Feed */}
                <div className="pb-12">
                    <NotificationsList
                        notifications={notifications}
                        isLoading={isLoading}
                        error={error as Error | null}
                    />
                </div>

            </div>
        </div>
    );
}