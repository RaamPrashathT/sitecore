import { useNavigate, useSearchParams } from "react-router-dom";
import { useInvitationDetails } from "../../hooks/useInvitationDetails";
import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";
import { useSession } from "@/features/auth/hooks/useSession";
import Cookies from "js-cookie";
const ClientInviteDetails = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const {
        data: invitationDetails,
        isLoading: invitationDetailsLoading,
        error,
    } = useInvitationDetails(token);
    const { user, isLoading: sessionLoading } = useSession();

    if (!token)
        return (
            <div className="p-8 text-center text-muted-foreground">
                No token provided
            </div>
        );
    
    

    if (invitationDetailsLoading || sessionLoading)
        return <div className="p-8 text-center">Loading...</div>;
    if (error)
        return (
            <div className="p-8 text-center text-destructive">
                Error: {error.message}
            </div>
        );

    if(!user) {
        Cookies.set("return-to", `/invitation?token=${token}`, { expires: 1/48})
        navigate("/login")
    }

    const admins = invitationDetails?.admins || [];

    return (
        <div className="flex min-h-[80vh] items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-none border-none">
                <CardHeader className="flex flex-col items-center gap-4 pb-2 border-b">
                    <div className="flex justify-center">
                        {admins.length > 1 ? (
                            <AvatarGroup>
                                {admins.map((admin) => (
                                    <Avatar
                                        key={admin.userId}
                                        className="border-2 border-background w-12 h-12"
                                    >
                                        <AvatarFallback>
                                            {admin.username
                                                ?.at(0)
                                                ?.toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                ))}
                            </AvatarGroup>
                        ) : (
                            <Avatar className="w-12 h-12 border">
                                <AvatarFallback className="text-xl">
                                    {admins[0]?.username?.at(0)?.toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        )}
                    </div>

                    <div className="text-center space-y-1">
                        <h2 className="text-xl font-semibold tracking-tight">
                            Project Invitation
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            You've been invited by{" "}
                            <span className="font-medium text-foreground">
                                {admins.map((a) => a.username).join(", ")}
                            </span>{" "}
                            to join as a client.
                        </p>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6 ">
                    <div className="space-x-1.5 flex flex-row">
                        <p className="font-medium">Organization: </p>
                        <span className="font-medium">
                            {invitationDetails?.organization.name}
                        </span>
                    </div>

                    {invitationDetails?.projects && (
                        <div className="space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Project Access
                            </p>
                            <ul className="divide-y divide-border border-y border-border/50">
                                {invitationDetails.projects.map((project) => (
                                    <li
                                        key={project.id}
                                        className="flex items-center justify-between py-2.5 text-sm"
                                    >
                                        <span className="font-medium text-zinc-900">
                                            {project.name}
                                        </span>
                                        <span className="text-xs text-muted-foreground italic">
                                            Client Access
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex gap-3 pt-2">
                    <Button variant="outline" className="flex-1">
                        Decline
                    </Button>
                    <Button className="flex-1">Accept Invitation</Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default ClientInviteDetails;
