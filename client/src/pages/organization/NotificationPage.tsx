import { useGetNotifications } from "@/features/notifications/hooks/useGetNotifications";
import { NotificationsList } from "@/features/notifications/components/NotificationsList";

export default function NotificationPage() {
    const { data: notifications, isLoading, error } = useGetNotifications();

    return (
        <div className="flex-1 flex flex-col bg-white">
            <div className="border-b border-slate-200 px-6 py-6">
                <h1 
                    className="text-3xl font-bold text-slate-900" 
                    style={{ fontFamily: "DM Serif Display" }}
                >
                    Notifications
                </h1>
                <p 
                    className="text-sm text-slate-600 mt-2" 
                    style={{ fontFamily: "IBM Plex Sans" }}
                >
                    Stay updated with your organization activities
                </p>
            </div>

            <div className="flex-1 overflow-auto p-6">
                <div className="max-w-3xl">
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
