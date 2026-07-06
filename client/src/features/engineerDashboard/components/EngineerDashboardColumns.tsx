import { createColumnHelper } from "@tanstack/react-table";
import type { EngineerDashboardResponse } from "../hooks/useEngineerDashboardItem";
import { ChevronDown } from "lucide-react";

const columnHelper = createColumnHelper<EngineerDashboardResponse>();

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
    columnHelper.display({
        id: "activeProjects",
        header: "Active Projects",
        cell: (info) => (
            <div className="font-medium flex items-center h-12 px-4">
                {info.row.original.activeProjects.length}
            </div>
        ),
    }),
    columnHelper.display({
        id: "actionablePhases",
        header: "Actionable Phases",
        cell: (info) => (
            <div className="font-medium flex items-center h-12 px-4">
                {info.row.original.actionablePhases.length}
            </div>
        ),
    }),
    columnHelper.display({
        id: "recentRequisitions",
        header: "Recent Requisitions",
        cell: (info) => (
            <div className="font-medium flex items-center h-12 px-4">
                {info.row.original.recentRequisitions.length}
            </div>
        ),
    }),
];
