import ProjectListDataTable from "@/features/project/manage/components/ProjectListDataTable";
import { useMembership } from "@/hooks/useMembership";
import { useProjectList } from "@/features/project/manage/hooks/useProjectList";
import { useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import {
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { ProjectColumns as columns } from "./ProjectColumn";
import ProjectListPagination from "./ProjectListPagination";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import ProjectSearch from "./ProjectSearch";
import ProjectSkeleton from "./ProjectSkeleton";

const ProjectManageMain = () => {
    const [globalFilter, setGlobalFilter] = useState<string>("");
    const debouncedSearch = useDebounce(globalFilter, 200);

    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 24,
    });

    const { data: membership, isLoading: membershipLoading } = useMembership();
    const { data: projectList, isLoading: projectListLoading } = useProjectList(
        membership?.id,
        pagination.pageIndex,
        pagination.pageSize,
        debouncedSearch,
    );

    const table = useReactTable({
        data: projectList?.data ?? [],
        rowCount: projectList?.count ?? 0,
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
        membershipLoading || (projectListLoading && !projectList);

    if (isInitialLoading) return <ProjectSkeleton />;
    if (!membership || !projectList) return <div>No access</div>;

    return (
        <div className="px-4 pb-4 pt-2 flex flex-col font-sans h-full">
            <div className="flex items-center justify-between  mb-2 border-b border-border/70 pb-3">
                {membership.role === "ADMIN" && (
                    <Button className="bg-green-700 text-white hover:bg-green-800">
                        <Link
                            to={`/${membership.slug}/projects/create`}
                            className="flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            <span className="text-sm">Create Project</span>
                        </Link>
                    </Button>
                )}
                <ProjectSearch table={table} />
            </div>
            <div className="rounded-xl border border-border/70 bg-background flex-1">
                <ProjectListDataTable table={table} slug={membership.slug} />
            </div>
            <div className="mt-auto pt-4">
                <ProjectListPagination table={table} />
            </div>
        </div>
    );
};

export default ProjectManageMain;
