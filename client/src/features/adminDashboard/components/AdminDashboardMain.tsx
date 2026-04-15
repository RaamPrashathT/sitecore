import { useMembership } from "@/hooks/useMembership";
import { useGetDashboardItems } from "../hooks/useGetDashboardItems";
import AdminDashboardDataTable from "./AdminDashboardDataTable";
import {
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { columns } from "./AdminDashboardColumns";
import SearchTableControl from "./SearchTableControl";
import AdminDashboardSkeleton from "./AdminDashboardSkeleton";
import { useDebounce } from "@/hooks/useDebounce";

const AdminDashboardMain = () => {
    const [globalFilter, setGlobalFilter] = useState<string>("");
    const debouncedSearch = useDebounce(globalFilter, 200);
    const [rowSelection, setRowSelection] = useState({});

    const { data: membership, isLoading: membershipLoading } = useMembership();
    const { data: dashboardItems, isLoading: dashboardItemsLoading } =
        useGetDashboardItems(membership?.id, debouncedSearch);

    const table = useReactTable({
        data: dashboardItems?.data ?? [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onGlobalFilterChange: setGlobalFilter,
        manualFiltering: true,
        onRowSelectionChange: setRowSelection,
        getRowId: (row) => row.id,
        state: { globalFilter, rowSelection },
    });

    const isInitialLoading =
        membershipLoading || (dashboardItemsLoading && !dashboardItems);

    if (isInitialLoading) return <AdminDashboardSkeleton />;
    if (membership == null || dashboardItems == null) return <div>No access</div>;

    const totalItems = dashboardItems.data.length;
    const urgentCount = dashboardItems.data.filter((i) => i.daysTillOrder <= 3).length;

    return (
        <section className="col-span-12 lg:col-span-8 flex flex-col gap-6 px-4 lg:px-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-2">
                <div>
                    <p className="text-[11px] uppercase tracking-widest text-slate-400 font-mono mb-1.5">
                        Procurement · Admin
                    </p>
                    <h2 className="text-[28px] font-bold text-slate-900 tracking-tight font-display leading-none">
                        Materials to Fulfill
                    </h2>
                    {totalItems > 0 && (
                        <p className="text-[13px] text-slate-500 mt-1.5">
                            {totalItems} item{totalItems !== 1 ? "s" : ""} pending
                            {urgentCount > 0 && (
                                <span className="ml-2 text-red-500 font-semibold">
                                    · {urgentCount} urgent
                                </span>
                            )}
                        </p>
                    )}
                </div>
                <SearchTableControl table={table} />
            </div>

            {/* Table */}
            <div className="flex-1 w-full min-h-0">
                <AdminDashboardDataTable table={table} />
            </div>
        </section>
    );
};

export default AdminDashboardMain;
