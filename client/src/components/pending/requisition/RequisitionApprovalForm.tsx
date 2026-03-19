import { useMembership } from "@/hooks/useMembership";
import { usePendingRequisitionList } from "@/hooks/usePendingRequisitionList";
import DataTable from "./DataTable";
import EmptyPendingRequisitionApproval from "./EmptyPendingRequisitionApproval";

const PendingRequisitionApprovalForm = () => {
    const { data: membership, isLoading: membershipLoading } = useMembership();
    const { data: pendingRequisitions, isLoading: pendingRequisitionsLoading } =
        usePendingRequisitionList(membership?.id);

    if (membershipLoading || pendingRequisitionsLoading) {
        return <div>Loading...</div>;
    }
    if (!membership) {
        return <div>No data</div>;
    }
    if (!pendingRequisitions || pendingRequisitions.length === 0) {
        return (
            <div>
                <EmptyPendingRequisitionApproval slug={membership?.slug} />
            </div>
        );
    }
    return (
        <div>
            <DataTable data={pendingRequisitions} />
        </div>
    );
};

export default PendingRequisitionApprovalForm;
