import { createColumnHelper } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import type { SupplierQuotesListItem } from "../../hooks/useSupplierQuotes";

const col = createColumnHelper<SupplierQuotesListItem>();

export const quoteColumns = [
    col.accessor("supplier.name", {
        id: "supplier",
        header: "Supplier",
        filterFn: "includesString",
    }),
    col.accessor("truePrice", {
        id: "truePrice",
        header: "True Price",
    }),
    col.accessor("standardRate", {
        id: "standardRate",
        header: "Std. Rate",
    }),
    col.display({
        id: "margin",
        header: "Margin",
    }),
    col.accessor("leadTime", {
        id: "leadTime",
        header: "Lead Time",
    }),
    col.display({
        id: "actions",
        header: "",
    }),
];

// Column widths — single source of truth used by both header and rows
export const COLUMN_WIDTHS = "grid-cols-[2fr_1fr_1fr_1fr_1fr_72px]";

// Shared cell value formatters
export const fmt = {
    price: (v: number) => `₹${v.toLocaleString("en-IN")}`,
    leadTime: (v: number | null) => (v === null ? "—" : `${v}d`),
    margin: (v: number) => `₹${v.toLocaleString("en-IN")}`,
    marginColor: (v: number) =>
        cn("font-mono tabular-nums font-semibold text-sm", v >= 0 ? "text-emerald-600" : "text-red-500"),
};
