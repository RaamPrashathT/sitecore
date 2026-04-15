import type { Table } from "@tanstack/react-table";
import type { DashboardItemType } from "../hooks/useGetDashboardItems";
import AdminDashboardCard from "./AdminDashboardCard";
import { Package } from "lucide-react";

interface AdminDashboardDataTableProps {
    readonly table: Table<DashboardItemType>;
}

const AdminDashboardDataTable = ({ table }: AdminDashboardDataTableProps) => {
    const rows = table.getRowModel().rows;

    if (rows.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 rounded-2xl bg-slate-50 ring-1 ring-slate-200/80">
                <div className="w-12 h-12 rounded-2xl bg-white ring-1 ring-slate-200 flex items-center justify-center mb-4 shadow-sm">
                    <Package className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-700">Nothing to fulfill</p>
                <p className="text-xs text-slate-400 mt-1">All materials are accounted for</p>
            </div>
        );
    }

    // Group rows by urgency for section headers
    const urgentRows = rows.filter((r) => r.original.daysTillOrder <= 3);
    const dueSoonRows = rows.filter((r) => r.original.daysTillOrder > 3 && r.original.daysTillOrder <= 7);
    const upcomingRows = rows.filter((r) => r.original.daysTillOrder > 7);

    const SectionHeader = ({
        label,
        count,
        accent,
    }: {
        label: string;
        count: number;
        accent: string;
    }) => (
        <div className={`flex items-center gap-2.5 mb-3 mt-1`}>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${accent}`}>{label}</span>
            <span className="text-[10px] font-mono font-semibold text-slate-400 tabular-nums">{count}</span>
            <div className="flex-1 h-px bg-slate-100" />
        </div>
    );

    // If all items are in one group, skip section headers
    const hasMultipleGroups =
        [urgentRows, dueSoonRows, upcomingRows].filter((g) => g.length > 0).length > 1;

    if (!hasMultipleGroups) {
        return (
            <div className="flex flex-col gap-3">
                {rows.map((row) => (
                    <AdminDashboardCard key={row.id} row={row} />
                ))}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-1">
            {urgentRows.length > 0 && (
                <div className="mb-2">
                    <SectionHeader label="Action Required" count={urgentRows.length} accent="text-red-500" />
                    <div className="flex flex-col gap-3">
                        {urgentRows.map((row) => (
                            <AdminDashboardCard key={row.id} row={row} />
                        ))}
                    </div>
                </div>
            )}

            {dueSoonRows.length > 0 && (
                <div className="mb-2">
                    <SectionHeader label="Due This Week" count={dueSoonRows.length} accent="text-amber-500" />
                    <div className="flex flex-col gap-3">
                        {dueSoonRows.map((row) => (
                            <AdminDashboardCard key={row.id} row={row} />
                        ))}
                    </div>
                </div>
            )}

            {upcomingRows.length > 0 && (
                <div className="mb-2">
                    <SectionHeader label="Upcoming" count={upcomingRows.length} accent="text-slate-400" />
                    <div className="flex flex-col gap-3">
                        {upcomingRows.map((row) => (
                            <AdminDashboardCard key={row.id} row={row} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboardDataTable;
