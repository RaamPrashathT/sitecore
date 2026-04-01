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
            className="flex items-center gap-2 bg-green-700 text-white hover:bg-green-800 font-sans"
            disabled={isPending}
        >
            {isPending ? (
                <>
                    <Spinner className="h-4 w-4" />
                    <span className="text-sm">Approving...</span>
                </>
            ) : (
                <>
                    <Plus className="h-4 w-4" />
                    <span className="text-sm">Approve Requisition</span>
                </>
            )}
        </Button>
    );
};

export default ApproveRequisitionButton;
