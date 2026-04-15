import { useParams } from "react-router-dom";
import { useGetRequisitionCatalogue } from "../hooks/useGetRequisitionCatalogue";
import {
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { RequisitionColumns as columns } from "./requisitionColumns";
import { useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import RequisitionTable from "./RequisitionTable";
import RequisitionSearch from "./RequisitionSearch";
import RequisitionPagination from "./RequisitionPagination";

const RequisitionSelectionMain = () => {
    const { phaseSlug } = useParams();
    const [globalFilter, setGlobalFilter] = useState<string>("");
    const debouncedSearch = useDebounce(globalFilter, 200);

    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 24,
    });

    const { data, isLoading } = useGetRequisitionCatalogue(
        phaseSlug,
        pagination.pageIndex,
        pagination.pageSize,
        debouncedSearch,
    );

    const table = useReactTable({
        data: data?.catalogue.data ?? [],
        rowCount: data?.catalogue.count ?? 0,
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

    const isInitialLoading = isLoading && !data;

    if (isInitialLoading) return <div className="p-12 text-slate-500 font-mono">Loading items...</div>;
    if (!data) return <div className="p-12 text-red-500 font-mono">ERR: No access</div>;

    return (
        <div className="px-8 py-8 h-full flex flex-col bg-slate-50/30">
            <div className="mb-4 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-bold font-display text-slate-900 tracking-tight mb-2">Requisition</h1>
                </div>
                
                {/* Placed Search elegantly next to the header */}
                <div className="pb-1">
                    <RequisitionSearch table={table} />
                </div>
            </div>

            {/* Main Table */}
            <div className="flex-1">
                <RequisitionTable table={table} />
            </div>

            {/* Pagination aligned at the bottom */}
            <div className="mt-6 mb-4 flex justify-end">
                <RequisitionPagination table={table} />
            </div>
        </div>
    );
};

export default RequisitionSelectionMain;