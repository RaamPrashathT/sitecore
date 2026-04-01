import { createColumnHelper } from "@tanstack/react-table";
import type { PendingRequisitionItemType } from "../hooks/usePendingRequisition";

const columnHelper = createColumnHelper<PendingRequisitionItemType>();

export const PendingRequisitionItemColumns = [
    columnHelper.accessor("itemName", {
        header: "Item Name",
        cell: (info) => (
            <div className="flex h-full min-h-12 items-center font-sans text-sm font-medium text-foreground">
                {info.getValue()}
            </div>
        ),
    }),
    columnHelper.accessor("supplierName", {
        header: "Supplier",
        cell: (info) => (
            <div className="flex h-full min-h-12 items-center font-sans text-sm text-muted-foreground">
                {info.getValue() || "Pending Selection"}
            </div>
        ),
    }),
    columnHelper.accessor("quantity", {
        header: "Quantity",
        cell: (info) => (
            <div className="flex h-full min-h-12 items-center font-mono text-sm tabular-nums text-foreground">
                {info.getValue()} <span className="text-muted-foreground ml-1 font-sans">{info.row.original.unit}</span>
            </div>
        ),
    }),
    columnHelper.accessor("truePrice", {
        header: "True Price",
        cell: (info) => {
            const rate = info.getValue();
            return (
                <div className="flex h-full min-h-12 items-center font-mono text-sm tabular-nums text-foreground">
                    ₹{rate ? `${rate.toFixed(2)}` : "-"}
                </div>
            );
        },
    }),
    columnHelper.accessor("standardRate", {
        header: "Standard Rate",
        cell: (info) => {
            const rate = info.getValue();
            return (
                <div className="flex h-full min-h-12 items-center font-mono text-sm tabular-nums text-foreground">
                    ₹{rate ? `${rate.toFixed(2)}` : "-"}
                </div>
            );
        },
    }),
    columnHelper.accessor("estimatedUnitCost", {
        header: "Total Cost",
        cell: (info) => (
            <div className="flex h-full min-h-12 items-center font-mono text-sm font-semibold tabular-nums text-green-700">
                ₹{info.getValue().toFixed(2)}
            </div>
        ),
    }),
    columnHelper.accessor("estimatedUnitCost", {
        header: "Total Profit",
        cell: (info) => (
            <div className="flex h-full min-h-12 items-center font-mono text-sm font-semibold tabular-nums text-green-700">
                ₹{(info.getValue() - ((info.row.original.truePrice || 0) * info.row.original.quantity)).toFixed(2)}
            </div>  
        ),
    }),
];