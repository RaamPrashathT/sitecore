import { useDebounce } from "@/hooks/useDebounce";
import { useMembership } from "@/hooks/useMembership";
import {
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { usePendingRequisitionList } from "../hooks/usePendingRequisition";
import { PendingRequisitionsColumn as columns } from "./PendingRequisitionsColumns";
import PendingRequisitionSearch from "./PendingRequisitionsSearch";
import PendingRequisitionTable from "./PendingRequisitionsTable";
import PendingRequisitionPagination from "./PendingRequisitionsPagination";

const PendingRequisitionMain = () => {
    const [globalFilter, setGlobalFilter] = useState<string>("");
    const debouncedSearch = useDebounce(globalFilter, 200);

    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 24,
    });

    const { data: membership, isLoading: membershipLoading } = useMembership();
    const {
        data: pendingPayments,
        isLoading: pendingPaymentsLoading,
        isError,
    } = usePendingRequisitionList(
        membership?.id,
        pagination.pageIndex,
        pagination.pageSize,
        debouncedSearch,
    );

    const table = useReactTable({
        data: pendingPayments?.data ?? [],
        rowCount: pendingPayments?.count ?? 0,
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
        membershipLoading || (pendingPaymentsLoading && !pendingPayments);

    if (isInitialLoading) return <></>;
    if (!membership || isError) return <div>No access</div>;

    return (
        <div className="px-4 pb-4 pt-2 flex flex-col h-full font-sans">
            <div className="mb-4 flex flex-wrap items-center justify-end gap-3 border-b border-border/70 pb-3">
                <PendingRequisitionSearch table={table} />
            </div>
            <div className="rounded-xl border border-border/70 bg-background h-full">
                <PendingRequisitionTable table={table} />
            </div>
            <div className="mt-auto pt-4">
                <PendingRequisitionPagination table={table} />
            </div>
        </div>
    );
};

export default PendingRequisitionMain;
