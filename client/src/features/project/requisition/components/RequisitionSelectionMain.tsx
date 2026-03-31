import { useGetCatalogues } from "@/features/catalogue/hooks/useGetCatalogues";
import { useMembership } from "@/hooks/useMembership";
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
    const [globalFilter, setGlobalFilter] = useState<string>("");
    const debouncedSearch = useDebounce(globalFilter, 200);

    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 24,
    });

    const { data: membership, isLoading: membershipLoading } = useMembership();
    const { data: catalogueItems, isLoading: catalogueItemsLoading } =
        useGetCatalogues(
            membership?.id,
            pagination.pageIndex,
            pagination.pageSize,
            debouncedSearch,
        );

    const table = useReactTable({
        data: catalogueItems?.data ?? [],
        rowCount: catalogueItems?.count ?? 0,
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
        membershipLoading || (catalogueItemsLoading && !catalogueItems);

    if (isInitialLoading) return <>Loading...</>;
    if (!membership || !catalogueItems) return <div>No access</div>;

    return (
        <div className="px-4 h-full flex flex-col">
            <div className="flex flex-row justify-end items-center py-2">
                <RequisitionSearch table={table} />
            </div>
            <div>
                <RequisitionTable table={table} />
            </div>
            <div className="mt-auto mb-4">
                <RequisitionPagination table={table} />
            </div>
        </div>
    );
};

export default RequisitionSelectionMain;
