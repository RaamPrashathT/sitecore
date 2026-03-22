import { createColumnHelper } from "@tanstack/react-table";
import type { EngineerDashboardItem } from "../hooks/useEngineerDashboardItem";

const columnHelper = createColumnHelper<EngineerDashboardItem>();

export const EngineerColumns = [
    columnHelper.accessor("itemName", {
        header: "Project",
        cell: (info) => (
            <div className="font-medium flex items-center h-12 px-4">
                {info.getValue()}
            </div>
        ),
    }),
    columnHelper.accessor("supplierName", {
        header: "Phase Name",
        cell: (info) => (
            <div className="font-medium flex items-center h-12 px-4">
                {info.getValue()}
            </div>
        ),
    }),
    columnHelper.accessor("quantity", {
        header: "Budget",
        cell: (info) => (
            <div className="font-medium flex items-center h-12 px-4">
                {info.getValue()}/{info.row.original.unit}
            </div>
        ),
    }),
    columnHelper.accessor("estimatedUnitCost", {
        header: "Cost",
        cell: (info) => (
            <div className="font-medium flex items-center h-12 px-4">
                {info.getValue()}
            </div>
        ),
    }),
    columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
            const status = info.getValue();
            let style;
            if (status === "UNORDERED") {
                style = "bg-red-200 border-red-500 text-red-700";
            } else {
                style = "bg-green-200 border-green-500 text-green-700";
            }
            return (
                <div className={`font-medium flex items-center h-12 px-4`}>
                    <div className={`${style} px-2 py-1 rounded-lg border capitalize`}>{status.toLowerCase()}</div>
                </div>
            );
        },
    }),
];
