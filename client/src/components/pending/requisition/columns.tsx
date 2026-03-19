import type { PendingRequisitionListType } from "@/hooks/usePendingRequisitionList";
import { createColumnHelper } from "@tanstack/react-table";

const columnHelper = createColumnHelper<PendingRequisitionListType>();

export const columns = [
    columnHelper.accessor("projectName", {
        header: "Project",
        cell: (info) => (
            <div>
                <p>{info.getValue()}</p>
            </div>
        ),
    }),

    columnHelper.accessor("phaseName", {
        header: "Phase",
        cell: (info) => (
            <div>
                <p>{info.getValue()}</p>
            </div>
        ),
    }),

    columnHelper.accessor("engineer.name", {
        header: "Engineer",
        cell: (info) => (
            <div>
                <p>{info.getValue()}</p>
            </div>
        ),
    }),

    columnHelper.accessor("budget", {
        header: "Budget",
        cell: (info) => (
            <div>
                <p>₹{info.getValue()}</p>
            </div>
        ),
    }),

];
