import type { PendingPhaseListType } from "@/hooks/usePendingPhaseList";
import { createColumnHelper } from "@tanstack/react-table";
import ApprovePhasePaymentButton from "./ApprovePhasePaymentButton";

const columnHelper = createColumnHelper<PendingPhaseListType>();

export const columns = [
    columnHelper.accessor("projectName", {
        header: "Project",
        cell: (info) => (
            <div>
                <p>{info.getValue()}</p>
            </div>
        ),
    }),

    columnHelper.accessor("phaseName", {
        header: "Phase",
        cell: (info) => (
            <div>
                <p>{info.getValue()}</p>
            </div>
        ),
    }),

    columnHelper.accessor("client", {
        header: "Client",
        cell: (info) => (
            <div>
                <p>{info.getValue()}</p>
            </div>
        ),
    }),

    columnHelper.accessor("budget", {
        header: "Amount Due",
        cell: (info) => (
            <div>
                <p>₹{info.getValue()}</p>
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
                <div className="flex flex-col">
                    <p className="font-medium">
                        {deadline.toLocaleDateString()}
                    </p>
                    <p
                        className={`text-xs ${isOverdue ? "text-red-500" : "text-gray-500"} `}
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
                <div>
                    <ApprovePhasePaymentButton id={phaseId} />
                </div>
            )
        }
    })
];
