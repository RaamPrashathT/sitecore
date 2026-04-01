import { useDebounce } from "@/hooks/useDebounce";
import { useMembership } from "@/hooks/useMembership";
import {
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import PendingInvitationSearch from "./PendingInvitationSearch";
import PendingInvitationPagination from "./PendingInvitationPagination";
import PendingInvitationTable from "./PendingInvitationTable";
import {
    usePendingInvitations,
} from "../hooks/usePendingInvitations";
import { PendingInvitationColumns as columns } from "./PendingInvitationColumns";

const PendingInvitationMain = () => {
    const [globalFilter, setGlobalFilter] = useState<string>("");
    const debouncedSearch = useDebounce(globalFilter, 200);

    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 24,
    });

    const { data: membership, isLoading: membershipLoading } = useMembership();
    const { data: PendingInvitations, isLoading: PendingInvitationsLoading } =
        usePendingInvitations(
            membership?.id,
            pagination.pageIndex,
            pagination.pageSize,
            debouncedSearch,
        );

    const table = useReactTable({
        data: PendingInvitations?.data ?? [],
        rowCount: PendingInvitations?.totalCount ?? 0,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onPaginationChange: setPagination,
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onGlobalFilterChange: setGlobalFilter,
        manualFiltering: true,
        manualSorting: true,
        manualPagination: true,
        getRowId: (row) => row.userId,
        state: {
            globalFilter,
            pagination,
        },
    });

    const isInitialLoading =
        membershipLoading || (PendingInvitationsLoading && !PendingInvitations);

    if (isInitialLoading) return <></>;
    if (!membership) return <div>No access</div>;

    return (
        <div className="px-4 pb-4 pt-2 flex flex-col h-full font-sans">
            <div className="mb-4 flex flex-wrap items-center justify-end gap-3 border-b border-border/70 pb-3">
                <PendingInvitationSearch table={table} />
            </div>
            <div className="rounded-xl border border-border/70 bg-background h-full">
                <PendingInvitationTable table={table} />
            </div>
            <div className="mt-auto pt-4">
                <PendingInvitationPagination table={table} />
            </div>
        </div>
    );
};

export default PendingInvitationMain;
