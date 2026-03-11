import type { ProjectListType } from "@/hooks/useProjectList";
import { createColumnHelper } from "@tanstack/react-table";

const columnHelper = createColumnHelper<ProjectListType>();

export const columns = [
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
