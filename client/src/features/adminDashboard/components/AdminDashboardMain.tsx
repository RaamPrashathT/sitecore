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
        manualFiltering: true, // Backend handles filtering
        onRowSelectionChange: setRowSelection, 
        getRowId: (row) => row.id,
        state: {
            globalFilter,
            rowSelection, 
        },
    });

    const isInitialLoading = membershipLoading || (dashboardItemsLoading && !dashboardItems);

    if (isInitialLoading) return <AdminDashboardSkeleton />;
    if (!membership || !dashboardItems) return <div>No access</div>;
    
    return (
        <section className="col-span-12 lg:col-span-8 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-foreground tracking-tight">
                    Materials to Fulfill
                </h2>
                <SearchTableControl table={table} />
            </div>

            <div className="flex-1 w-full min-h-0">
                <AdminDashboardDataTable table={table} />
            </div>
        </section>
    );
};

export default AdminDashboardMain;