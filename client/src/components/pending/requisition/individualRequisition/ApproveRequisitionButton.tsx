import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useMembership } from "@/hooks/useMembership";
import api from "@/lib/axios";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface ApproveRequisitionButtonProps {
    requisitionId: string;
}

const ApproveRequisitionButton = ({
    requisitionId,
}: ApproveRequisitionButtonProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const { data: membership, isLoading: membershipLoading } = useMembership();
    const navigate = useNavigate();

    if (membershipLoading) return <div>Loading...</div>;
    if (!membership) return <div>No data</div>;

    const approveRequisition = async () => {
        setIsLoading(true);
        try {
            await api.post(
                `project/phase/approveRequisition`,
                {
                    requisitionId,
                },
                {
                    headers: {
                        "x-organization-id": membership.id,
                    },
                },
            );
            navigate(`/${membership.slug}/pending-requisitions`);
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <Button onClick={approveRequisition} className="flex items-center gap-2">
            {isLoading ? (
                <div className="flex items-center gap-x-2 ">
                    <Spinner />
                    <p>Approving Requisition...</p>
                </div>
            ) : (
                <div className="flex items-center gap-x-2 ">
                    <Plus />
                    <p>Approve Requisition</p>
                </div>
            )}
        </Button>
    );
};

export default ApproveRequisitionButton;
