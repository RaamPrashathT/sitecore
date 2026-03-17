import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useMembership } from "@/hooks/useMembership";
import api from "@/lib/axios";
import { X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface RejectRequisitionButtonProps {
    requisitionId: string;
}

const RejectRequisitionButton = ({
    requisitionId,
}: RejectRequisitionButtonProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const { data: membership, isLoading: membershipLoading } = useMembership();
    const navigate = useNavigate();

    if (membershipLoading) return <div>Loading...</div>;
    if (!membership) return <div>No data</div>;

    const rejectRequisition = async () => {
        setIsLoading(true);
        try {
            await api.post(
                `/project/phase/rejectRequisition`,
                {
                    requisitionId,
                },
                {
                    headers: {
                        "x-organization-id": membership.id,
                    },
                },
            );
            navigate(`/${membership.slug}/pending-requests`);
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <Button
            variant={"destructive"}
            onClick={rejectRequisition}
            
        >
            {isLoading ? (
                <div className="flex items-center gap-x-2 ">
                    <Spinner />
                    <p>Rejecting Requisition...</p>
                </div>
            ) : (
                <div className="flex items-center gap-x-2 ">
                    <X />
                    <p>Reject Requisition</p>
                </div>
            )}
        </Button>
    );
};

export default RejectRequisitionButton;
