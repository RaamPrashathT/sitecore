import { useDebounce } from "@/hooks/useDebounce";
import { useMembership } from "@/hooks/useMembership";
import { getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { useState } from "react";
import PendingPaymentSearch from "./PendingPaymentSearch";
import PendingPaymentPagination from "./PendingPaymentPagination";
import PendingPaymentTable from "./PendingPaymentTable";
import { usePendingPhaseList } from "../hooks/usePendingPhaseList";
import { PendingPaymentColumns as columns } from "./PendingPaymentColumns";
// import PendingPaymentEmpty from "./PendingPaymentEmpty";

const PendingPaymentMain = () => {
    const [globalFilter, setGlobalFilter] = useState<string>("");
    const debouncedSearch = useDebounce(globalFilter, 200);

    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 24,
    });
    

    const { data: membership, isLoading: membershipLoading } = useMembership();
    const { data: pendingPayments, isLoading: pendingPaymentsLoading } =
        usePendingPhaseList(
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
    if (!membership) return <div>No access</div>;
    
    return (
        <div className="px-4 pb-4 pt-2 flex flex-col h-full font-sans">
            <div className="mb-4 flex flex-wrap items-center justify-end gap-3 border-b border-border/70 pb-3">
                <PendingPaymentSearch table={table} />
            </div>
            <div className="rounded-xl border border-border/70 bg-background h-full">
                <PendingPaymentTable table={table} />
            </div>
            <div className="mt-auto pt-4">
                <PendingPaymentPagination table={table} />
            </div>
        </div>
    );
};

export default PendingPaymentMain;