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
    const [error, setError] = useState<string | null>(null);

        const {
            data: invitationDetails,
            isLoading: invitationDetailsLoading,
            error: fetchError,
        } = useInvitationDetails(token);
        
        const { user, isLoading: sessionLoading } = useSession();

       

        // const { mutate: acceptInvite, isPending: isAccepting } = useMutation({
        //     mutationFn: async () => {
        //         return api.post("/clients/accept-invitation", { token });
        //     },
        //     onSuccess: () => {
        //         sessionStorage.removeItem("pending_invite_token");
        //         queryClient.clear();
        //         navigate("/organizations");
        //     },
        //     onError: (error: unknown) => {
        //         if (axios.isAxiosError(error)) {
        //             setError(
        //                 error.response?.data?.message || "Failed to accept invite",
        //             );
        //         }
        //     },
        // });

        // if (!token)
        //     return (
        //         <div className="p-8 text-center text-muted-foreground">
        //             No token provided
        //         </div>
        //     );
        // if (invitationDetailsLoading || sessionLoading)
        //     return <div className="p-8 text-center">Loading...</div>;
        // if (fetchError)
        //     return (
        //         <div className="p-8 text-center text-destructive">
        //             Error: {fetchError.message}
        //         </div>
        //     );

        // const admins = invitationDetails?.admins || [];

    return (
        <div>

        </div>
    );
};

export default ClientInvitation;
