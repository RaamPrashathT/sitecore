import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import type { PendingRequisitionItemType } from "../hooks/usePendingRequisition";
import { PendingRequisitionItemColumns as columns } from "./PendingRequisitionItemColumns";
import PendingRequisitionItemTable from "./PendingRequisitionItemTable";
import RejectRequisitionButton from "@/components/pending/requisition/individualRequisition/RejectRequisitionButton";
import ApproveRequisitionButton from "./RequisitionApprovalButton";

interface PendingRequisitionItemProps {
    pendingRequisitionItems: PendingRequisitionItemType[];
    requisitionId: string;
}

const PendingRequisitionItemMain = ({ pendingRequisitionItems, requisitionId } :PendingRequisitionItemProps ) => {

    const table = useReactTable({
        data: pendingRequisitionItems,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="px-4">
            <div>
                <PendingRequisitionItemTable table={table} />
            </div>
            <div className="mt-2 flex flex-row justify-between">
                <RejectRequisitionButton requisitionId={requisitionId} />
                <ApproveRequisitionButton requisitionId={requisitionId} />
            </div>
        </div>
    );
};

export default PendingRequisitionItemMain;
