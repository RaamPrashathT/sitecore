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
import OrderButton from "./OrderButton";
import SearchTableControl from "./SearchTableControl";
import AdminDashboardPagination from "./AdminDashboardPagination";
import AdminDashboardSkeleton from "./AdminDashboardSkeleton";
import { useDebounce } from "@/hooks/useDebounce";

const AdminDashboardMain = () => {
    const [globalFilter, setGlobalFilter] = useState<string>("");
    const debouncedSearch = useDebounce(globalFilter, 200);

    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 24,
    });
    
    // 1. Add the state for row selection
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
            rowSelection, // 3. Add to state
        },
    });

    // 4. Extract just the IDs of the selected rows
    const selectedIds = table.getSelectedRowModel().rows.map(r => r.original.id);

    const isInitialLoading =
        membershipLoading || (dashboardItemsLoading && !dashboardItems);

    if (isInitialLoading) return <AdminDashboardSkeleton />;
    if (!membership || !dashboardItems) return <div>No access</div>;
    
    return (
        <div className="px-4">
            <div className="flex flex-row justify-between items-center py-2">
                {/* 5. Pass the IDs and a clear function to the button */}
                <OrderButton 
                    selectedIds={selectedIds} 
                    clearSelection={() => table.resetRowSelection()} 
                />
                <SearchTableControl table={table} />
            </div>
            <div>
                <AdminDashboardDataTable table={table} />
            </div>
            <div className="text-center">
                <AdminDashboardPagination table={table} />
            </div>
        </div>
    );
};

export default AdminDashboardMain;