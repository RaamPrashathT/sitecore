import { createColumnHelper } from "@tanstack/react-table";
import type { DashboardItemType } from "../hooks/useGetDashboardItems";
import { Checkbox } from "@/components/ui/checkbox";

const columnHelper = createColumnHelper<DashboardItemType>();

export const columns = [
    columnHelper.display({
        id: "select",
        header: ({ table }) => (
            <div className="flex items-center justify-center h-12 px-4">
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) =>
                        table.toggleAllPageRowsSelected(!!value)
                    }
                    aria-label="Select all"
                />
            </div>
        ),
        cell: ({ row }) => (
            <div className="flex items-center justify-center h-12 px-4">
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
    }),
    columnHelper.accessor("projectName", {
        header: "Project",
        cell: (info) => (
            <div className="font-medium flex items-center h-12 px-4">
                {info.getValue()}
            </div>
        ),
    }),
    columnHelper.accessor("supplierName", {
        header: "Supplier Name",
        cell: (info) => (
            <div className="font-medium flex items-center h-12 px-4">
                {info.getValue()}
            </div>
        ),
    }),
    columnHelper.accessor("itemName", {
        header: "Item Name",
        cell: (info) => (
            <div className="font-medium flex items-center h-12 px-4">
                {info.getValue()}
            </div>
        ),
    }),
    columnHelper.accessor("quantity", {
        header: "Quantity",
        cell: (info) => (
            <div className="font-medium flex items-center h-12 px-4">
                {info.getValue()} {info.row.original.unit}
            </div>
        ),
    }),
    columnHelper.accessor("truePrice", {
        header: "Total Cost",
        cell: (info) => (
            <div className="font-medium flex items-center h-12 px-4">
                {(info.getValue() || 0) * info.row.original.quantity}
            </div>
        ),
    }),
    columnHelper.display({
        id: "orderBy",
        header: "Order By Date",
        cell: ({ row }) => {
            const item = row.original;
            const dropDeadDate = new Date(item.phaseStartDate);
            dropDeadDate.setDate(dropDeadDate.getDate() - item.leadTime);

            return (
                <div className="flex flex-col justify-center h-12 px-4">
                    <span className="font-medium">
                        {dropDeadDate.toLocaleDateString()}
                    </span>
                    <span> {row.original.daysTillOrder} to order</span>
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
