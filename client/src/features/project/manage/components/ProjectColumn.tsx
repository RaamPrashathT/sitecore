import type { ProjectListType } from "@/features/project/manage/hooks/useProjectList";
import { createColumnHelper } from "@tanstack/react-table";

const columnHelper = createColumnHelper<ProjectListType>();

export const ProjectColumns = [
    columnHelper.accessor("name", {
        header: "Project Name",
        cell: (info) => {
            const projectName = info.row.original.name;
            return (
                <div className='font-medium flex items-center h-12 px-4'>
                    {projectName}
                </div>
            );
        },
    }),
    columnHelper.accessor("estimatedBudget", {
        header: "Estimated Budget",
        cell: (info) => {
            return (
                <div className='font-medium flex items-center h-12 px-4'>
                    {info.getValue()}
                </div>
            );
        },
    }),
    columnHelper.accessor("phases", {
        header: "Phases",
        cell: (info) => {
            return (
                <div className='font-medium flex items-center h-12 px-4'>
                    {info.getValue()}
                </div>
            );
        },
    }),
    columnHelper.accessor("assignments", {
        header: "No. of Assignments",
        cell: (info) => {
            return (
                <div className='font-medium flex items-center h-12 px-4'>
                    {info.getValue()}
                </div>
            );
        },
    }),
];
