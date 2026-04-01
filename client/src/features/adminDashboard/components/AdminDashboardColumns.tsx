import { createColumnHelper } from "@tanstack/react-table";
import type { DashboardItemType } from "../hooks/useGetDashboardItems";
import { Checkbox } from "@/components/ui/checkbox";

const columnHelper = createColumnHelper<DashboardItemType>();

const mono = { fontFamily: "'IBM Plex Mono', monospace" } as const;
const sans = { fontFamily: "'IBM Plex Sans', sans-serif" } as const;
const serif = { fontFamily: "'Fraunces', serif" } as const;

const statusConfig: Record<string, { pill: string }> = {
    URGENT:   { pill: "bg-red-50 text-red-700 border border-red-200" },
    DUE:      { pill: "bg-amber-50 text-amber-700 border border-amber-200" },
    UPCOMING: { pill: "bg-green-50 text-green-700 border border-green-200" },
};

export const columns = [
    columnHelper.display({
        id: "select",
        header: ({ table }) => (
            <div className="flex items-center justify-center px-4 h-11">
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) =>
                        table.toggleAllPageRowsSelected(!!value)
                    }
                    aria-label="Select all"
                    className="border-stone-300 data-[state=checked]:bg-green-700 data-[state=checked]:border-green-700"
                />
            </div>
        ),
        cell: ({ row }) => (
            <div className="flex items-center justify-center px-4 h-11">
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                    className="border-stone-300 data-[state=checked]:bg-green-700 data-[state=checked]:border-green-700"
                />
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
    }),

    columnHelper.accessor("projectName", {
        header: () => (
            <span className="text-[10px] uppercase tracking-widest text-stone-400 font-medium px-4" style={sans}>
                Project
            </span>
        ),
        cell: (info) => (
            <div className="flex items-center h-11 px-4">
                <span className="text-sm text-stone-800 font-semibold" style={serif}>
                    {info.getValue()}
                </span>
            </div>
        ),
    }),

    columnHelper.accessor("supplierName", {
        header: () => (
            <span className="text-[10px] uppercase tracking-widest text-stone-400 font-medium px-4" style={sans}>
                Supplier
            </span>
        ),
        cell: (info) => (
            <div className="flex items-center h-11 px-4">
                <span className="text-sm text-stone-600" style={sans}>
                    {info.getValue() ?? <span className="text-stone-300">—</span>}
                </span>
            </div>
        ),
    }),

    columnHelper.accessor("itemName", {
        header: () => (
            <span className="text-[10px] uppercase tracking-widest text-stone-400 font-medium px-4" style={sans}>
                Item
            </span>
        ),
        cell: (info) => (
            <div className="flex items-center h-11 px-4">
                <span className="text-sm text-stone-800 font-medium" style={sans}>
                    {info.getValue()}
                </span>
            </div>
        ),
    }),

    columnHelper.accessor("quantity", {
        header: () => (
            <span className="text-[10px] uppercase tracking-widest text-stone-400 font-medium px-4" style={sans}>
                Qty needed
            </span>
        ),
        cell: (info) => (
            <div className="flex items-center h-11 px-4">
                <span className="text-sm text-stone-800 tabular-nums" style={mono}>
                    {info.getValue()}{" "}
                    <span className="text-stone-400 text-xs">{info.row.original.unit}</span>
                </span>
            </div>
        ),
    }),

    columnHelper.accessor("inventory", {
        header: () => (
            <span className="text-[10px] uppercase tracking-widest text-stone-400 font-medium px-4" style={sans}>
                In warehouse
            </span>
        ),
        cell: (info) => (
            <div className="flex items-center h-11 px-4">
                <span className="text-sm text-stone-800 tabular-nums" style={mono}>
                    {info.getValue() ?? <span className="text-stone-300">—</span>}
                </span>
            </div>
        ),
    }),

    columnHelper.accessor("truePrice", {
        header: () => (
            <span className="text-[10px] uppercase tracking-widest text-stone-400 font-medium px-4" style={sans}>
                Total cost
            </span>
        ),
        cell: (info) => (
            <div className="flex items-center h-11 px-4">
                <span className="text-sm text-stone-800 tabular-nums" style={mono}>
                    {((info.getValue() || 0) * info.row.original.quantity).toLocaleString()}
                </span>
            </div>
        ),
    }),

    columnHelper.display({
        id: "orderBy",
        header: () => (
            <span className="text-[10px] uppercase tracking-widest text-stone-400 font-medium px-4" style={sans}>
                Order by
            </span>
        ),
        cell: ({ row }) => {
            const item = row.original;
            const dropDeadDate = new Date(item.phaseStartDate);
            dropDeadDate.setDate(dropDeadDate.getDate() - item.leadTime);

            return (
                <div className="flex flex-col justify-center h-11 px-4 gap-0.5">
                    <span className="text-sm text-stone-800 tabular-nums" style={mono}>
                        {dropDeadDate.toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                        })}
                    </span>
                    <span className="text-[11px] text-stone-400" style={sans}>
                        {item.daysTillOrder}d remaining
                    </span>
                </div>
            );
        },
    }),

    columnHelper.accessor("status", {
        header: () => (
            <span className="text-[10px] uppercase tracking-widest text-stone-400 font-medium px-4" style={sans}>
                Status
            </span>
        ),
        cell: (info) => {
            const status = info.getValue();
            const config = statusConfig[status] ?? statusConfig.UPCOMING;
            return (
                <div className="flex items-center h-11 px-4">
                    <span
                        className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full capitalize ${config.pill}`}
                        style={sans}
                    >
                        {status.toLowerCase()}
                    </span>
                </div>
            );
        },
    }),
];