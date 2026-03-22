import { createColumnHelper } from "@tanstack/react-table";
import type { EngineerDashboardPhase } from "../hooks/useEngineerDashboardItem";
import { ChevronDown } from "lucide-react";

const columnHelper = createColumnHelper<EngineerDashboardPhase>();

export const EngineerColumns = [
    columnHelper.display({
        id: "expand",
        size: 48, 
        header: () => <div className="w-12" />,
        cell: () => (
            <div className="flex items-center justify-center w-12 h-12">
                <ChevronDown
                    className="h-4 w-4 text-gray-400 transition-transform duration-200 group-data-[state=open]:rotate-180"
                />
            </div>
        ),
    }),
    columnHelper.accessor("projectName", {
        header: "Project",
        cell: (info) => (
            <div className="font-medium flex items-center h-12 px-4">
                {info.getValue()}
            </div>
        ),
    }),
    columnHelper.accessor("name", {
        header: "Phase Name",
        cell: (info) => (
            <div className="font-medium flex items-center h-12 px-4">
                {info.getValue()}
            </div>
        ),
    }),
    columnHelper.accessor("budget", {
        header: "Budget",
        cell: (info) => (
            <div className="font-medium flex items-center h-12 px-4">
                {info.getValue()}
            </div>
        ),
    }),
];