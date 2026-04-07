import { createColumnHelper } from "@tanstack/react-table";
import type { DashboardItemType } from "../hooks/useGetDashboardItems";

const columnHelper = createColumnHelper<DashboardItemType>();

export const columns = [
    columnHelper.display({
        id: "select",
        enableSorting: false,
        enableHiding: false,
    }),
    columnHelper.accessor("projectName", {
        id: "projectName",
    }),
    columnHelper.accessor("supplierName", {
        id: "supplierName",
    }),
    columnHelper.accessor("itemName", {
        id: "itemName",
    }),
    columnHelper.accessor("status", {
        id: "status",
    }),
];