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
import AdminDashboardPagination from "./AdminDashboardPagination";
import AdminDashboardSkeleton from "./AdminDashboardSkeleton";
import { useDebounce } from "@/hooks/useDebounce";

const AdminDashboardMain = () => {
    const [globalFilter, setGlobalFilter] = useState<string>("");
    const debouncedSearch = useDebounce(globalFilter, 200);

    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10, // Adjusted default to fit the larger cards better
    });
    
    const [rowSelection, setRowSelection] = useState({});

    const { data: membership, isLoading: membershipLoading } = useMembership();
    const { data: dashboardItems, isLoading: dashboardItemsLoading } =
        useGetDashboardItems(
            membership?.id,
            pagination.pageIndex,
            pagination.pageSize,
            debouncedSearch,
        );

    const table = useReactTable({
        data: dashboardItems?.data ?? [],
        rowCount: dashboardItems?.count ?? 0,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onPaginationChange: setPagination,
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onGlobalFilterChange: setGlobalFilter,
        manualFiltering: true,
        manualSorting: true,
        manualPagination: true,
        onRowSelectionChange: setRowSelection, 
        getRowId: (row) => row.id,
        state: {
            globalFilter,
            pagination,
            rowSelection, 
        },
    });

    const isInitialLoading = membershipLoading || (dashboardItemsLoading && !dashboardItems);

    if (isInitialLoading) return <AdminDashboardSkeleton />;
    if (!membership || !dashboardItems) return <div>No access</div>;
    
    return (
        <section className="col-span-12 lg:col-span-8 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground tracking-tight">Materials to Fulfill</h2>
                <div className="flex flex-row justify-between">
                <SearchTableControl table={table} />
            </div>
            </div>

            {/* Controls */}
            

            {/* Main Content List */}
            <div className="flex-1">
                <AdminDashboardDataTable table={table} />
            </div>

            {/* Pagination */}
            <div className="mt-8 mb-4">
                <AdminDashboardPagination table={table} />
            </div>
        </section>
    );
};

export default AdminDashboardMain;