import { createColumnHelper } from "@tanstack/react-table";
import type { ActionablePhase } from "../hooks/useEngineerDashboardItem";

const columnHelper = createColumnHelper<ActionablePhase>();

export const EngineerColumns = [
    columnHelper.accessor("projectName", {
        header: "Project",
        cell: (info) => (
            <div className="font-medium flex items-center h-12 px-4">
                {info.getValue()}
            </div>
        ),
    }),
    columnHelper.accessor("phaseName", {
        header: "Phase Name",
        cell: (info) => (
            <div className="font-medium flex items-center h-12 px-4">
                {info.getValue()}
            </div>
        ),
    }),
    columnHelper.accessor("phaseSlug", {
        header: "Phase Slug",
        cell: (info) => (
            <div className="font-medium flex items-center h-12 px-4">
                {info.getValue()}
            </div>
        ),
    }),
    columnHelper.accessor("phaseId", {
        header: "Phase ID",
        cell: (info) => (
            <div className="font-medium flex items-center h-12 px-4">
                {info.getValue()}
            </div>
        ),
    }),
];
