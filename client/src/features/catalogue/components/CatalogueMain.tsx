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
import CatalogueSkeleton from "../../project/manage/components/ProjectSkeleton";

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

    if (isInitialLoading) return <CatalogueSkeleton />;
    if (!membership || !catalogueItems) {
        return <div className="px-4 py-6 font-sans text-sm text-muted-foreground">No access</div>;
    }

    return (
        <div className="px-4 pb-4 pt-2 flex flex-col h-full font-sans">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3">
                <Button className="bg-green-700 text-white hover:bg-green-800">
                    <Link
                        to={`/${membership.slug}/catalogue/create`}
                        className="flex items-center gap-x-1"
                    >
                        <Plus className="size-4" />
                        <p className="font-sans text-sm">Add Catalogue Item</p>
                    </Link>
                </Button>
                <CatalogueSearch table={table} />
            </div>
            <div className="rounded-xl border border-border/70 bg-background">
                <CatalogueDataTable table={table} />
            </div>
            <div className="mt-auto pt-4">
                <CataloguePagination table={table} />
            </div>
        </div>
    );
};

export default CatalogueMain;
