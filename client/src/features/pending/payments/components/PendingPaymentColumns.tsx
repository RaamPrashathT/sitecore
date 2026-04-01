import type { PendingPhaseListType } from "@/features/pending/payments/hooks/usePendingPhaseList";
import { createColumnHelper } from "@tanstack/react-table";
import ApprovePhasePaymentButton from "./PendingPaymentApprove";

const columnHelper = createColumnHelper<PendingPhaseListType>();

export const PendingPaymentColumns = [
    columnHelper.accessor("projectName", {
        header: "Project",
        cell: (info) => (
            <div className="flex h-full min-h-12 items-center font-sans text-sm font-medium text-foreground">
                {info.getValue()}
            </div>
        ),
    }),

    columnHelper.accessor("phaseName", {
        header: "Phase",
        cell: (info) => (
            <div className="flex h-full min-h-12 items-center font-sans text-sm font-medium text-muted-foreground">
                {info.getValue()}
            </div>
        ),
    }),

    columnHelper.accessor("client", {
        header: "Client",
        cell: (info) => (
            <div className="flex h-full min-h-12 items-center font-sans text-sm font-medium text-muted-foreground">
                {info.getValue()}
            </div>
        ),
    }),

    columnHelper.accessor("budget", {
        header: "Amount Due",
        cell: (info) => (
            <div className="flex h-full min-h-12 items-center font-mono text-sm font-medium text-foreground tabular-nums">
                ₹{info.getValue()}
            </div>
        ),
    }),

    columnHelper.accessor("paymentDeadline", {
        header: "Payment Deadline",
        cell: (info) => {
            const deadline = new Date(info.getValue());
            const now = new Date();

            const diffInMs = deadline.getTime() - now.getTime();
            const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

            let displayStatus = "";
            let isOverdue = false;

            if (diffInDays < 0) {
                isOverdue = true;
                const absoluteDays = Math.abs(diffInDays);
                displayStatus = `${absoluteDays} day${absoluteDays === 1 ? "" : "s"} overdue`;
            } else if (diffInDays === 0) {
                displayStatus = "Due today";
            } else {
                displayStatus = `${diffInDays} day${diffInDays === 1 ? "" : "s"} remaining`;
            }

            return (
                <div className="flex flex-col h-full min-h-12 justify-center">
                    <p className="font-mono text-sm text-foreground tabular-nums">
                        {deadline.toLocaleDateString()}
                    </p>
                    <p
                        className={`text-xs font-sans ${isOverdue ? "text-red-500" : "text-muted-foreground"}`}
                    >
                        {displayStatus}
                    </p>
                </div>
            );
        },
    }),

    columnHelper.display({
        id: "Approve",
        header: "Approve",
        cell: (info) => {
            const phaseId = info.row.original.id;
            return (
                <div className="flex h-full min-h-12 items-center px-4">
                    <ApprovePhasePaymentButton id={phaseId} />
                </div>
            )
        }
    })
];
