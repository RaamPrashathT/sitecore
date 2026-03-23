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
import PendingRequisitionEmpty from "./PendingRequisitionEmpty";

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
    
    if (!pendingPayments || pendingPayments.count === 0) {
        return <PendingRequisitionEmpty slug={membership.slug} />;
    }
    return (
        <div className="px-4 flex flex-col h-full">
            <div className="flex flex-row justify-end items-center py-2">
                <PendingRequisitionSearch table={table} />
            </div>
            <div>
                <PendingRequisitionTable table={table} />
            </div>
            <div className="mt-auto mb-4">
                <PendingRequisitionPagination table={table} />
            </div>
        </div>
    );
};

export default PendingRequisitionMain;
