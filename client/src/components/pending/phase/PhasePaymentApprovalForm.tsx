import { usePendingPhaseList } from "@/features/pending/payments/hooks/usePendingPhaseList";
import DataTable from "./DataTable";
import { useMembership } from "@/hooks/useMembership";

const PhasePaymentApprovalForm = () => {
    const { data: membership, isLoading: membershipLoading } = useMembership();
    const { data: pendingPhase, isLoading: pendingPhaseLoading } =
        usePendingPhaseList(membership?.id);

    if (membershipLoading || pendingPhaseLoading) {
        return <div>Loading...</div>;
    }
    if (!membership || !pendingPhase) {
        return <div>No data</div>;
    }
    return (
        <div>
            <DataTable data={pendingPhase} />
        </div>
    );
};

export default PhasePaymentApprovalForm;
