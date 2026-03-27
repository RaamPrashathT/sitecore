import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useInvitationDetails } from "../hooks/useInvitationDetails";
import { useAcceptInvitation } from "../hooks/useAcceptInvitation";
import { useDeclineInvitation } from "../hooks/useDeclineInvitation";
import { useSession } from "@/features/auth/hooks/useSession"; 
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import api from "@/lib/axios";

function InvitePreview({ invitation }: { readonly invitation: NonNullable<ReturnType<typeof useInvitationDetails>["data"]> }) {
    return (
        <>
            <CardHeader className="flex flex-col items-center gap-4 pb-4 border-b">
                <div className="flex -space-x-2">
                    {invitation.admins.slice(0, 3).map((admin) => (
                        <Avatar key={admin.userId} className="w-10 h-10 border-2 border-background">
                            <AvatarImage src={admin.profileImage ?? undefined} />
                            <AvatarFallback>
                                {admin.username?.at(0)?.toUpperCase() ?? "?"}
                            </AvatarFallback>
                        </Avatar>
                    ))}
                </div>

                <div className="text-center space-y-1">
                    <h2 className="text-xl font-semibold tracking-tight">You've been invited</h2>
                    <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">
                            {invitation.admins.map((a) => a.username).join(", ")}
                        </span>{" "}
                        invited you to join in their organization
                    </p>
                </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-4">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Organization</span>
                    <span className="font-medium">{invitation.organization.name}</span>
                </div>

                {invitation.projects.length > 0 && (
                    <div className="flex items-start justify-between text-sm">
                        <span className="text-muted-foreground">Projects</span>
                        <div className="flex flex-wrap gap-1.5 justify-end max-w-[60%]">
                            {invitation.projects.map((p) => (
                                <Badge key={p.id} variant="secondary">
                                    {p.name}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </>
    );
}

const Invitation = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: invitation, isLoading: isInviteLoading, isError } = useInvitationDetails(token);
    const { user, isLoading: isSessionLoading } = useSession();

    // Custom Mutations
    const { mutate: acceptInvite, isPending: isAccepting, isError: acceptFailed } = useAcceptInvitation();
    const { mutate: declineInvite, isPending: isDeclining } = useDeclineInvitation();

    // The Provisioning Interceptor
    useEffect(() => {
        if (invitation?.sessionState === "AUTHENTICATED" && user && !user.onboarded) {
            navigate(`/provisioning?token=${token}`);
        }
    }, [invitation?.sessionState, user, navigate, token]);

    // Handlers
    const handleAccept = () => {
        if (!token) return;
        acceptInvite({ token }, {
            onSuccess: () => {
                const projectId = invitation?.projects[0]?.id;
                if (projectId) {
                    navigate(`/projects/${projectId}`);
                } else {
                    navigate("/organizations");
                }
            }
        });
    };

    const handleDecline = () => {
        if (!token) return;
        declineInvite({ token }, {
            onSuccess: () => {
                navigate("/organizations");
            }
        });
    };

    const isFullyLoading = isInviteLoading || (invitation?.sessionState === "AUTHENTICATED" && isSessionLoading);

    if (isFullyLoading) {
        return (
            <div className="flex min-h-[80vh] items-center justify-center">
                <Spinner />
            </div>
        );
    }

    if (isError || !invitation) {
        return (
            <div className="flex min-h-[80vh] items-center justify-center p-4">
                <Card className="w-full max-w-md text-center shadow-none border-none">
                    <CardContent className="pt-8 space-y-3">
                        <p className="text-lg font-semibold">Invalid invitation</p>
                        <p className="text-sm text-muted-foreground">
                            This invite link has expired, is malformed, or has already been claimed.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // STATE: UNAUTHENTICATED
    if (invitation.sessionState === "UNAUTHENTICATED") {
        return (
            <div className="flex min-h-[80vh] items-center justify-center p-4">
                <Card className="w-full max-w-md shadow-none border-none">
                    <InvitePreview invitation={invitation} />
                    <CardFooter className="flex flex-col gap-2 pt-4">
                        {invitation.userExists ? (
                            <>
                                <Button className="w-full" onClick={() => navigate(`/login?token=${token}`)}>
                                    Log in to accept
                                </Button>
                                <p className="text-xs text-center text-muted-foreground">
                                    Don't have an account?{" "}
                                    <button type="button" className="underline underline-offset-4 hover:text-foreground" onClick={() => navigate(`/register?token=${token}`)}>
                                        Register
                                    </button>
                                </p>
                            </>
                        ) : (
                            <>
                                <Button className="w-full" onClick={() => navigate(`/register?token=${token}`)}>
                                    Create account to accept
                                </Button>
                                <p className="text-xs text-center text-muted-foreground">
                                    Already have an account?{" "}
                                    <button type="button" className="underline underline-offset-4 hover:text-foreground" onClick={() => navigate(`/login?token=${token}`)}>
                                        Log in
                                    </button>
                                </p>
                            </>
                        )}
                    </CardFooter>
                </Card>
            </div>
        );
    }

    // STATE: MISMATCH
    if (invitation.sessionState === "MISMATCH") {
        return (
            <div className="flex min-h-[80vh] items-center justify-center p-4">
                <Card className="w-full max-w-md shadow-none border-none">
                    <InvitePreview invitation={invitation} />
                    <CardContent className="pt-2">
                        <div className="rounded-md bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 px-4 py-3 text-sm text-yellow-800 dark:text-yellow-200">
                            You're currently logged in as <span className="font-medium">{invitation.currentUser}</span>.
                            This invite was sent to a different email address.
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2 pt-2">
                        <Button
                            className="w-full"
                            onClick={async () => {
                                await api.post("/auth/logout");
                                queryClient.clear();
                                navigate(`/login?token=${token}`);
                            }}
                        >
                            Log out and switch account
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    // STATE: AUTHENTICATED (And Onboarded, thanks to the useEffect interceptor)
    return (
        <div className="flex min-h-[80vh] items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-none border-none">
                <InvitePreview invitation={invitation} />
                <CardFooter className="flex flex-col gap-2 pt-4">
                    {acceptFailed && (
                        <p className="text-sm text-red-500 text-center">
                            Something went wrong. Please try again.
                        </p>
                    )}
                    <Button 
                        className="w-full" 
                        disabled={isAccepting || isDeclining} 
                        onClick={handleAccept}
                    >
                        {isAccepting ? (
                            <div className="flex items-center gap-x-1.5">
                                <Spinner />
                                Accepting...
                            </div>
                        ) : (
                            "Accept invitation"
                        )}
                    </Button>
                    <Button 
                        variant="ghost" 
                        className="w-full" 
                        disabled={isAccepting || isDeclining} 
                        onClick={handleDecline}
                    >
                        {isDeclining ? (
                            <div className="flex items-center gap-x-1.5">
                                <Spinner />
                                Declining...
                            </div>
                        ) : (
                            "Decline"
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Invitation;