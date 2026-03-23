import { createColumnHelper } from "@tanstack/react-table";
import type { PendingRequisitionItemType } from "../hooks/usePendingRequisition";

const columnHelper = createColumnHelper<PendingRequisitionItemType>();

export const PendingRequisitionItemColumns = [
    columnHelper.accessor("itemName", {
        header: "Item Name",
        cell: (info) => (
            <div className="font-medium h-12 flex items-center">
                {info.getValue()}
            </div>
        ),
    }),
    columnHelper.accessor("supplierName", {
        header: "Supplier",
        cell: (info) => (
            <div className="flex items-center h-12">
                {info.getValue() || "Pending Selection"}
            </div>
        ),
    }),
    columnHelper.accessor("quantity", {
        header: "Quantity",
        cell: (info) => (
            <div className="flex items-center h-12">
                {info.getValue()} <span className="text-muted-foreground ml-1">{info.row.original.unit}</span>
            </div>
        ),
    }),
    columnHelper.accessor("truePrice", {
        header: "True price",
        cell: (info) => {
            const rate = info.getValue();
            return (
                <div className="flex items-center h-12">
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
                <div className="flex items-center h-12">
                    ₹{rate ? `${rate.toFixed(2)}` : "-"}
                </div>
            );
        },
    }),
    columnHelper.accessor("estimatedUnitCost", {
        header: "Total Cost",
        cell: (info) => (
            <div className="font-semibold text-primary flex items-center h-12">
                ₹{info.getValue().toFixed(2)}
            </div>
        ),
    }),
    columnHelper.accessor("estimatedUnitCost", {
        header: "Total Profit",
        cell: (info) => (
            <div className="font-semibold text-primary flex items-center h-12">
                ₹{info.getValue() -((info.row.original.truePrice || 0) * info.row.original.quantity)}
            </div>  
        ),
    }),
];