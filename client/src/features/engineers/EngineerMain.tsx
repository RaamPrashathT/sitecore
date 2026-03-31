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
import EngineerInviteButton from "./EngineerInvite/EngineerInviteButton";

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
    if (!membership) return <div className="px-4 py-6 font-sans text-sm text-muted-foreground">No access</div>;
    if (!engineers || engineers.totalCount === 0) return <EngineerEmpty slug={membership.slug}/>;
    
    return (
        <div className="px-4 pb-4 pt-2 flex h-full flex-col font-sans">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3">
                <EngineerInviteButton />
                <EngineerSearch table={table} />
            </div>
            <div className="rounded-xl border border-border/70 bg-background">
                <EngineerTable table={table} />
            </div>
            <div className="mt-auto pt-4">
                <EngineerPagination table={table} />
            </div>
        </div>
    );
};

export default EngineerMain;