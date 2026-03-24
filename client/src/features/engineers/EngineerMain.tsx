import { useDebounce } from "@/hooks/useDebounce";
import { useMembership } from "@/hooks/useMembership";
import { getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { useState } from "react";
import EngineerSearch from "./EngineerSearch";
import EngineerPagination from "./EngineerPagination";
import EngineerTable from "./EngineerTable";
import { useEngineers } from "@/hooks/useEngineers";
import { EngineerColumns as columns } from "./EngineerColumns";
import EngineerEmpty from "./EngineerEmpty";
// import EngineerEmpty from "./EngineerEmpty";

const EngineerMain = () => {
    const [globalFilter, setGlobalFilter] = useState<string>("");
    const debouncedSearch = useDebounce(globalFilter, 200);

    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 24,
    });
    

    const { data: membership, isLoading: membershipLoading } = useMembership();
    const { data: engineers, isLoading: engineersLoading } =
        useEngineers(
            membership?.id,
            pagination.pageIndex,
            pagination.pageSize,
            debouncedSearch,
        );

    const table = useReactTable({
        data: engineers?.data ?? [],
        rowCount: engineers?.totalCount ?? 0,
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
        membershipLoading || (engineersLoading && !engineers);

    if (isInitialLoading) return <></>;
    if (!membership) return <div>No access</div>;
    if (!engineers || engineers.totalCount === 0) return <EngineerEmpty slug={membership.slug}/>;
    
    return (
        <div className="px-4 flex flex-col h-full">
            <div className="flex flex-row justify-end items-center py-2">
                <EngineerSearch table={table} />
            </div>
            <div>
                <EngineerTable table={table} />
            </div>
            <div className="mt-auto mb-4">
                <EngineerPagination table={table} />
            </div>
        </div>
    );
};

export default EngineerMain;