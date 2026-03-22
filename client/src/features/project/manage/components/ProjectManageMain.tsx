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

    if (isInitialLoading) return <ProjectSkeleton/>;
    if (!membership || !projectList) return <div>No access</div>;

    return (
        <div className=" px-4 flex flex-col h-full">
            <div className="flex flex-row justify-between items-center py-2">
                <Button>
                    <Link
                        to={`/${membership.slug}/projects/create`}
                        className="flex items-center gap-x-1"
                    >
                        <Plus />
                        <p className="mb-px">Create Project</p>
                    </Link>
                </Button>
                <ProjectSearch table={table} />
            </div>
            <div className="h-full flex flex-col">
                <ProjectListDataTable table={table} slug={membership.slug} />
            </div>
            <div className="mt-auto mb-4">
                <ProjectListPagination table={table} />
            </div>
        </div>
    );
};

export default ProjectManageMain;
