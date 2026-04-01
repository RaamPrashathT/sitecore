import type { PendingRequisitionData } from "@/features/pending/requisitions/hooks/usePendingRequisition";
import { createColumnHelper } from "@tanstack/react-table";
import { ChevronRight } from "lucide-react";

const columnHelper = createColumnHelper<PendingRequisitionData>();

export const PendingRequisitionsColumn = [
    columnHelper.display({
        id: "expand",
        size: 48, 
        header: () => <div className="w-12" />,
        cell: () => (
            <div className="flex items-center justify-center w-12 h-12">
                <ChevronRight
                    className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-90"
                />
            </div>
        ),
    }),
    columnHelper.accessor("projectName", {
        header: "Project",
        cell: (info) => (
            <div className="flex h-full min-h-12 items-center px-4 font-sans text-sm font-medium text-foreground">
                {info.getValue()}
            </div>
        ),
    }),

    columnHelper.accessor("phaseName", {
        header: "Phase",
        cell: (info) => (
            <div className="flex h-full min-h-12 items-center px-4 font-sans text-sm font-medium text-muted-foreground">
                {info.getValue()}
            </div>
        ),
    }),

    columnHelper.accessor("engineer.name", {
        header: "Engineer",
        cell: (info) => (
            <div className="flex h-full min-h-12 items-center px-4 font-sans text-sm font-medium text-muted-foreground">
                {info.getValue()}
            </div>
        ),
    }),

    columnHelper.accessor("budget", {
        header: "Budget",
        cell: (info) => (
            <div className="flex h-full min-h-12 items-center px-4 font-mono text-sm font-medium text-foreground tabular-nums">
                ₹{info.getValue()}
            </div>
        ),
    }),

];
