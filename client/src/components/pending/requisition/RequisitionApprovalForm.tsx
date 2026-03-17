
import { useMembership } from "@/hooks/useMembership";
import { usePendingRequisitionList } from "@/hooks/usePendingRequisitionList";
import DataTable from "./DataTable";

const PendingRequisitionApprovalForm = () => {
    const { data: membership, isLoading: membershipLoading } = useMembership();
    const { data: pendingRequisitions, isLoading: pendingRequisitionsLoading } =
        usePendingRequisitionList(membership?.id);

    if (membershipLoading || pendingRequisitionsLoading) {
        return <div>Loading...</div>;
    }
    if (!membership || !pendingRequisitions) {
        return <div>No data</div>;
    }
    return (
        <div>
            <DataTable data={pendingRequisitions} />
        </div>
    );
};

export default PendingRequisitionApprovalForm;
