import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useMembership } from "@/hooks/useMembership";
import { X } from "lucide-react";
import { useUpdateRequisitions } from "../hooks/useUpdateRequisition";

interface RequisitionRejectionButton {
    requisitionId: string;
}

const ApproveRequisitionButton = ({
    requisitionId,
}: RequisitionRejectionButton) => {

    const { data: membership, isLoading: membershipLoading } = useMembership();
    const { mutate, isPending } = useUpdateRequisitions(membership?.id);

    if (membershipLoading || isPending) return <div>Loading...</div>;
    if (!membership) return <div>No data</div>;

    const rejectRequisition = async () => {
        mutate({
            requisitionId: requisitionId,
            action: "REJECT",
        });
    };

    return (
        <Button
            variant={"destructive"}
            onClick={rejectRequisition}
            
        >
            {isPending ? (
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

export default ApproveRequisitionButton;
