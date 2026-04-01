import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import type { NotificationSchema } from "../hooks/useGetNotifications";
import { useMembership } from "@/hooks/useMembership";

interface NotificationItemProps {
    notification: NotificationSchema;
}

const getRedirectLink = (notificationType: string, entityId: string, projectId: string | null, orgSlug: string | undefined): string => {
    const redirectMap: Record<string, string> = {
        REQUISITION_SUBMITTED: `/${orgSlug}/${projectId}/requisitions`,
        REQUISITION_APPROVED: `/${orgSlug}/${projectId}/requisitions`,
        REQUISITION_REJECTED: `/${orgSlug}/${projectId}/requisitions`,
        PHASE_STATUS_CHANGED: `/${orgSlug}/${projectId}/phases`,
        PHASE_PAYMENT_DUE: `/${orgSlug}/${projectId}/phases`,
        SITE_LOG_CREATED: `/${orgSlug}/${projectId}/logs`,
        PROJECT_STATUS_CHANGED: `/${orgSlug}/${projectId}`,
        PROJECT_INVITATION_ACCEPTED: `/${orgSlug}/${projectId}`,
        PROJECT_INVITATION_REJECTED: `/${orgSlug}/${projectId}`,
        ORGANIZATION_INVITATION_REQUEST: `/organization/members`,
    };
    
    return redirectMap[notificationType] || "/";
};

export const NotificationItem = ({ notification }: NotificationItemProps) => {
    const navigate = useNavigate();
    const {data: membership, isLoading} = useMembership();
    const { notification: notif } = notification;
    if(isLoading) {
        return <div>Loading...</div>;
    }
    const redirectLink = getRedirectLink(notif.type, notif.entityId, notif.projectId, membership?.slug);
    return (
        <Card 
            className="p-4 border-l-4 border-l-green-700 hover:bg-slate-50 transition-all duration-200 cursor-pointer group"
            onClick={() => navigate(redirectLink)}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <h3 
                            className="font-semibold text-sm text-slate-900 truncate" 
                            style={{ fontFamily: "IBM Plex Sans" }}
                        >
                            {notif.title}
                        </h3>
                        {!notification.isRead && (
                            <Badge className="bg-green-700 hover:bg-green-800 text-white text-xs font-medium flex-shrink-0">
                                New
                            </Badge>
                        )}
                    </div>
                    <p 
                        className="text-sm text-slate-600 mb-3 leading-relaxed" 
                        style={{ fontFamily: "IBM Plex Sans" }}
                    >
                        {notif.body}
                    </p>
                    <p 
                        className="text-xs text-slate-500 font-medium" 
                        style={{ fontFamily: "IBM Plex Mono" }}
                    >
                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                    </p>
                </div>
            </div>
        </Card>
    );
};
