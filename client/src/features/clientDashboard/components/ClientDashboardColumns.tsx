import { createColumnHelper } from "@tanstack/react-table";
import type { ClientDashboardItemSchema } from "../hooks/useClientDashboardItem"

const columnHelper = createColumnHelper<ClientDashboardItemSchema>();

export const ClientDashboardColumns = [
    columnHelper.accessor("projectName", {
        header: "Project",
        cell: (info) => (
            <div className="font-medium flex items-center h-12 px-4">
                {info.getValue()}
            </div>
        ),
    }),
    columnHelper.accessor("name", {
        header: "Phase Name",
        cell: (info) => (
            <div className="font-medium flex items-center h-12 px-4">
                {info.getValue()}
            </div>
        ),
    }),
    columnHelper.accessor("estimatedBudget", {
        header: "Total Cost",
        cell: (info) => (
            <div className="font-medium flex items-center h-12 px-4">
                {info.getValue()}
            </div>
        ),
    }),
    columnHelper.accessor("budget", {
        header: "Amount Due",
        cell: (info) => (
            <div className="font-medium flex items-center h-12 px-4">
                {info.getValue()}
            </div>
        ),
    }),
    columnHelper.display({
        id: "orderBy",
        header: "Payment Deadline",
        cell: ({ row }) => {
            const item = row.original;
            const dropDeadDate = new Date(item.paymentDeadline);
            dropDeadDate.setDate(dropDeadDate.getDate());

            return (
                <div className="flex flex-col justify-center h-12 px-4">
                    <span className="font-medium">
                        {dropDeadDate.toLocaleDateString()}
                    </span>
                    <span> {row.original.daysTillOrder} days to pay</span>
                </div>
            );
        },
    }),
    columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
            const status = info.getValue();
            let colorCode: string;
            let textColor: string;
            if(status === "URGENT") {
                colorCode="bg-red-200 border-red-500"
                textColor="text-red-700"
            } else if(status === "DUE") {
                colorCode="bg-yellow-200 border-yellow-500"
                textColor="text-yellow-700"
            } else {
                colorCode="bg-green-200 border-green-500"
                textColor="text-green-700"
            }
            return (
                <div className={`border rounded-sm ${colorCode} capitalize text-center py-1 w-24`}>
                    <p className={`font-medium ${textColor}`}>{status.toLocaleLowerCase()}</p>
                </div>
            )
        }
    }),
];
