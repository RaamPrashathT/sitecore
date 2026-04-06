import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { 
    ClipboardList, 
    Layers, 
    FileText, 
    Layout, 
    UserPlus, 
    Bell 
} from "lucide-react";
import type { NotificationSchema } from "../hooks/useGetNotifications";

interface NotificationItemProps {
    notification: NotificationSchema;
}

export const NotificationItem = ({ notification }: NotificationItemProps) => {
    const navigate = useNavigate();
    const notif = notification.notification;

    const handleClick = () => {
        if (notif.actionUrl) {
            navigate(notif.actionUrl);
        }
    };

    // Map types to specific Lucide icons
    const getIcon = (type: string) => {
        const iconProps = { size: 20, strokeWidth: 2 };
        switch (type.toUpperCase()) {
            case 'REQUISITION':
                return <ClipboardList {...iconProps} />;
            case 'PHASE':
                return <Layers {...iconProps} />;
            case 'SITE_LOG':
                return <FileText {...iconProps} />;
            case 'PROJECT':
                return <Layout {...iconProps} />;
            case 'INVITATION':
                return <UserPlus {...iconProps} />;
        }
    };

    return (
        <div
            onClick={handleClick}
            className={`
                group p-4 md:p-5 rounded-xl border transition-all cursor-pointer flex gap-4 items-start
                ${notification.isRead 
                    ? "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm" 
                    : "bg-green-50/30 border-green-200 hover:border-green-300 hover:shadow-sm"
                }
            `}
        >
            {/* Themed Icon Container */}
            <div className={`
                shrink-0 w-11 h-11 rounded-lg flex items-center justify-center
                ${notification.isRead 
                    ? "bg-gray-100 text-gray-500" 
                    : "bg-green-100 text-green-700"
                }
            `}>
                {getIcon(notif.entityType)}
            </div>

            <div className="flex-grow min-w-0">
                {/* Header Row */}
                <div className="flex justify-between items-start  gap-2">
                    <h3 className="font-sans text-[15px] font-semibold text-gray-900 truncate">
                        {notif.title}
                    </h3>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-gray-400 whitespace-nowrap shrink-0 mt-1">
                        {formatDistanceToNow(new Date(notif.createdAt))} ago
                    </span>
                </div>

                {/* Body Content */}
                {notif.body && (
                    <p className="font-sans text-sm text-gray-600  line-clamp-2 leading-relaxed">
                        {notif.body}
                    </p>
                )}

            </div>
        </div>
    );
};