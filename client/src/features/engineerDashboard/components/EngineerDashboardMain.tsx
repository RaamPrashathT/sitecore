import { useState } from "react";
import { EngineerColumns as columns } from "./EngineerDashboardColumns";
import { useDebounce } from "@/hooks/useDebounce";
import { useGetEngineerDashboardItems } from "../hooks/useEngineerDashboardItem";
import { useMembership } from "@/hooks/useMembership";
import { getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import EngineerDashboardDataTable from "./EngineerDashboardTable";
import EngineerSearch from "./EngineerDashboardSearch";
import EngineerDashboardPagination from "./EngineerDashboardPagination";

const EngineerDashboard = () => {
    const [globalFilter, setGlobalFilter] = useState<string>("");
    const debouncedSearch = useDebounce(globalFilter, 200);

    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 24,
    });

    const { data: membership, isLoading: membershipLoading } = useMembership();
    const { data: dashboardItems, isLoading: dashboardItemsLoading } =
        useGetEngineerDashboardItems(
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
        getRowId: (row) => row.id,
        state: {
            globalFilter,
            pagination,
        },
    });

    const isInitialLoading =
        membershipLoading || (dashboardItemsLoading && !dashboardItems);

    if (isInitialLoading) return <>Loading...</>;
    if (!membership || !dashboardItems) return <div>No access</div>;

    return (
        <div className="px-4 flex flex-col h-full">
            <div className=" py-2 flex justify-end">
                <EngineerSearch table={table} />
            </div>
            <div>
                <EngineerDashboardDataTable table={table} />
            </div>
            <div className="mt-auto mb-4">
                <EngineerDashboardPagination table={table} />
            </div>
        </div>
    );
};

export default EngineerDashboard;
