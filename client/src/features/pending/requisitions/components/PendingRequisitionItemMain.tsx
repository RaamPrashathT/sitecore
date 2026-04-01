import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import type { PendingRequisitionItemType } from "../hooks/usePendingRequisition";
import { PendingRequisitionItemColumns as columns } from "./PendingRequisitionItemColumns";
import PendingRequisitionItemTable from "./PendingRequisitionItemTable";
import ApproveRequisitionButton from "./RequisitionApprovalButton";
import RequisitionRejectionButton from "./RequisitionRejectionButton";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { ClipboardCheckIcon } from "lucide-react";

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

    const isEmpty = pendingRequisitionItems.length === 0;

    return (
        <div>
            {isEmpty ? (
                <div className="flex items-center justify-center py-12">
                    <Empty className="">
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <ClipboardCheckIcon />
                            </EmptyMedia>
                            <EmptyTitle className="font-display text-base">No Pending Requisitions</EmptyTitle>
                            <EmptyDescription className="font-sans text-sm">
                                No pending requisitions at the moment.
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                </div>
            ) : (
                <>
                    <div className="mb-4">
                        <PendingRequisitionItemTable table={table} />
                    </div>
                    <div className="flex flex-row justify-between items-center gap-3">
                        <RequisitionRejectionButton requisitionId={requisitionId} />
                        <ApproveRequisitionButton requisitionId={requisitionId} />
                    </div>
                </>
            )}
        </div>
    );
};

export default PendingRequisitionItemMain;
