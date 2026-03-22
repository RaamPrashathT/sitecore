import { CatalogueColumns as columns } from "./CatalogueColumns";
import {
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import CatalogueDataTable from "./CatalogueTable";
import { useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useMembership } from "@/hooks/useMembership";
import { useGetCatalogues } from "@/features/catalogue/hooks/useGetCatalogues";
import CataloguePagination from "./CataloguePagination";
import CatalogueSearch from "./CatalogueSearch";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

const CatalogueMain = () => {
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
        rowCount: catalogueItems?.data.length ?? 0,
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

    if (isInitialLoading) return <></>;
    if (!membership || !catalogueItems) return <div>No access</div>;

    return (
        <div className="px-4">
            <div className="flex flex-row justify-between items-center py-2">
                <Button>
                    <Link
                        to={`/${membership.slug}/catalogue/create`}
                        className="flex items-center gap-x-1"
                    >
                        <Plus />
                        <p className="mb-px">Add Item</p>
                    </Link>
                </Button>
                <CatalogueSearch table={table} />
            </div>
            <div>
                <CatalogueDataTable table={table} />
            </div>
            <div>
                <CataloguePagination table={table} />
            </div>
        </div>
    );
};

export default CatalogueMain;
