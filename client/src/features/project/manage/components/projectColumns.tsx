import type { ProjectListType } from "@/features/project/manage/hooks/useProjectList";
import { createColumnHelper } from "@tanstack/react-table";

const columnHelper = createColumnHelper<ProjectListType>();

export const projectColumns = [
    columnHelper.accessor("name", {
        header: "Project Name",
        cell: (info) => {
            const projectName = info.row.original.name;
            return (
                <div className="flex items-center">
                    {projectName}
                </div>
            );
        },
    }),

    columnHelper.accessor("name", {
        header: "Project Name",
        cell: (info) => {
            const projectName = info.row.original.name;
            return (
                <div className="flex items-center">
                    {projectName}
                </div>
            );
        },
    }),
];
