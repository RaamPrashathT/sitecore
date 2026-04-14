import { useState } from "react";
import {
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";
import { useMembership } from "@/hooks/useMembership";
import { useGetCatalogues } from "../hooks/useCatalogue";
import { CatalogueColumns } from "./CatalogueColumns";
import CatalogueDataTable from "./CatalogueTable";
import CataloguePagination from "./CataloguePagination";
import CatalogueSearch from "./CatalogueSearch";
import CatalogueSkeleton from "../../project/manage/components/ProjectSkeleton";

const CatalogueMain = () => {
    const [globalFilter, setGlobalFilter] = useState("");
    const debouncedSearch = useDebounce(globalFilter, 200);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 24 });

    const { data: membership, isLoading: membershipLoading } = useMembership();
    const { data: catalogueData, isLoading: catalogueLoading } = useGetCatalogues(
        pagination.pageIndex,
        pagination.pageSize,
        debouncedSearch,
    );

    const table = useReactTable({
        data: catalogueData?.data ?? [],
        rowCount: catalogueData?.count ?? 0,
        columns: CatalogueColumns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onPaginationChange: setPagination,
        onGlobalFilterChange: setGlobalFilter,
        manualFiltering: true,
        manualSorting: true,
        manualPagination: true,
        getRowId: (row) => row.id,
        state: { globalFilter, pagination },
    });

    if (membershipLoading || (catalogueLoading && !catalogueData)) {
        return <CatalogueSkeleton />;
    }

    if (!membership) {
        return (
            <div className="px-4 py-6 font-sans text-sm text-muted-foreground">
                No access
            </div>
        );
    }

    return (
        <div className="px-4 pb-4 pt-2 flex flex-col h-full font-sans">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3">
                <Button asChild className="bg-green-700 text-white hover:bg-green-800">
                    <Link
                        to={`/${membership.slug}/catalogue/create`}
                        className="flex items-center gap-x-1"
                    >
                        <Plus className="size-4" />
                        <span className="font-sans text-sm">Add Catalogue Item</span>
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
