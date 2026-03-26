import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useInvitationDetails } from "../../hooks/useInvitationDetails";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";
import { useSession } from "@/features/auth/hooks/useSession";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import axios from "axios";
import { useEffect, useState } from "react";

const ClientInvitation = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const [apiError, setApiError] = useState<string | null>(null);

    const {
        data: invitationDetails,
        isLoading: invitationDetailsLoading,
        error: fetchError,
    } = useInvitationDetails(token);

    const { user, isLoading: sessionLoading } = useSession();

    useEffect(() => {
        if (token) {
            sessionStorage.setItem("pending_invite_token", token);
        }
    }, [token]);

    const { mutate: acceptInvite, isPending: isAccepting } = useMutation({
        mutationFn: async () => {
            return api.post("/clients/accept-invitation", { token });
        },
        onSuccess: () => {
            sessionStorage.removeItem("pending_invite_token");
            queryClient.clear();
            navigate("/organizations");
        },
        onError: (error: unknown) => {
            if (axios.isAxiosError(error)) {
                setApiError(
                    error.response?.data?.message || "Failed to accept invite",
                );
            }
        },
    });

    if (!token)
        return (
            <div className="p-8 text-center text-muted-foreground">
                No token provided
            </div>
        );
    if (invitationDetailsLoading || sessionLoading)
        return <div className="p-8 text-center">Loading...</div>;
    if (fetchError)
        return (
            <div className="p-8 text-center text-destructive">
                Error: {fetchError.message}
            </div>
        );

    const admins = invitationDetails?.admins || [];

    return (
        <div className="flex min-h-[80vh] items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-none border-none">
                <CardHeader className="flex flex-col items-center gap-4 pb-2 border-b">
                    <div className="flex justify-center">
                        <Avatar className="w-12 h-12 border">
                            <AvatarFallback className="text-xl">
                                {admins[0]?.username?.at(0)?.toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
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

                <CardContent className="space-y-6 pt-4">
                    <div className="space-x-1.5 flex flex-row">
                        <p className="font-medium">Organization: </p>
                        <span className="font-medium">
                            {invitationDetails?.organization.name}
                        </span>
                    </div>

                    {apiError && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm text-center border border-red-200">
                            {apiError}
                            {apiError.includes("Mismatch") && (
                                <button
                                    className="mt-2 font-semibold underline cursor-pointer border-none bg-transparent"
                                    onClick={() => navigate("/login")}
                                >
                                    Click here to log out and switch accounts.
                                </button>
                            )}
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex gap-3 pt-2">
                    {user ? (
                        <>
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                    sessionStorage.removeItem(
                                        "pending_invite_token",
                                    );
                                    navigate("/");
                                }}
                            >
                                Decline
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={() => acceptInvite()}
                                disabled={isAccepting}
                            >
                                {isAccepting
                                    ? "Accepting..."
                                    : "Accept Invitation"}
                            </Button>
                        </>
                    ) : (
                        <div className="flex w-full gap-3 flex-col">
                            <Button asChild className="w-full">
                                <Link to="/register">Register to Accept</Link>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                className="w-full"
                            >
                                <Link to="/login">
                                    Log in with existing account
                                </Link>
                            </Button>
                        </div>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
};

export default ClientInvitation;
