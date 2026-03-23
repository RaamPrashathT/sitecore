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
                    className="h-4 w-4 text-gray-400 transition-transform duration-200 group-data-[state=open]:rotate-90"
                />
            </div>
        ),
    }),
    columnHelper.accessor("projectName", {
        header: "Project",
        cell: (info) => (
            <div className='font-medium flex items-center h-12 px-4'>
                <p>{info.getValue()}</p>
            </div>
        ),
    }),

    columnHelper.accessor("phaseName", {
        header: "Phase",
        cell: (info) => (
            <div className='font-medium flex items-center h-12 px-4'>
                <p>{info.getValue()}</p>
            </div>
        ),
    }),

    columnHelper.accessor("engineer.name", {
        header: "Engineer",
        cell: (info) => (
            <div className='font-medium flex items-center h-12 px-4'>
                <p>{info.getValue()}</p>
            </div>
        ),
    }),

    columnHelper.accessor("budget", {
        header: "Budget",
        cell: (info) => (
            <div className='font-medium flex items-center h-12 px-4'>
                <p>₹{info.getValue()}</p>
            </div>
        ),
    }),

];
