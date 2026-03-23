import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useMembership } from "@/hooks/useMembership";
import { Plus } from "lucide-react";
import { useUpdateRequisitions } from "../hooks/useUpdateRequisition";

interface ApproveRequisitionButtonProps {
    requisitionId: string;
}

const ApproveRequisitionButton = ({
    requisitionId,
}: ApproveRequisitionButtonProps) => {

    const { data: membership, isLoading: membershipLoading } = useMembership();
    const { mutate, isPending } = useUpdateRequisitions(membership?.id);

    if (membershipLoading || isPending) return <div>Loading...</div>;
    if (!membership) return <div>No data</div>;

    const approveRequisition = async () => {
        mutate({
            requisitionId: requisitionId,
            action: "APPROVE",
        });
    };

    return (
        <Button
            onClick={approveRequisition}
            className="flex items-center gap-2"
        >
            {isPending ? (
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
