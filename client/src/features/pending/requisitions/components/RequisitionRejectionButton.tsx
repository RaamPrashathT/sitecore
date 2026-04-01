import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useMembership } from "@/hooks/useMembership";
import { X } from "lucide-react";
import { useUpdateRequisitions } from "../hooks/useUpdateRequisition";

interface RequisitionRejectionButton {
    requisitionId: string;
}

const RequisitionRejectionButton = ({
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
            variant="destructive"
            onClick={rejectRequisition}
            className="flex items-center gap-2 font-sans"
            disabled={isPending}
        >
            {isPending ? (
                <>
                    <Spinner className="h-4 w-4" />
                    <span className="text-sm">Rejecting...</span>
                </>
            ) : (
                <>
                    <X className="h-4 w-4" />
                    <span className="text-sm">Reject Requisition</span>
                </>
            )}
        </Button>
    );
};

export default RequisitionRejectionButton;
