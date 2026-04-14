import { createColumnHelper } from "@tanstack/react-table";
import type { CatalogueItemType } from "../hooks/useCatalogue";
import CatalogueActionButton from "./CatalogueActionButton";
import { Badge } from "@/components/ui/badge";

const columnHelper = createColumnHelper<CatalogueItemType>();

const CATEGORY_LABELS: Record<string, string> = {
    MATERIALS: "Materials",
    LABOUR: "Labour",
    EQUIPMENT: "Equipment",
    SUBCONTRACTORS: "Subcontractors",
    TRANSPORT: "Transport",
    OVERHEAD: "Overhead",
};

export const CatalogueColumns = [
    columnHelper.accessor("name", {
        header: "Item Name",
        cell: (info) => (
            <div className="flex h-full min-h-12 items-center px-4 font-sans text-sm font-medium text-foreground">
                {info.getValue()}
            </div>
        ),
    }),

    columnHelper.accessor("category", {
        header: "Category",
        cell: (info) => (
            <div className="flex h-full min-h-12 items-center px-4">
                <Badge variant="outline" className="font-sans text-xs font-normal capitalize text-muted-foreground">
                    {CATEGORY_LABELS[info.getValue()] ?? info.getValue().toLowerCase()}
                </Badge>
            </div>
        ),
    }),

    columnHelper.accessor("unit", {
        header: "Unit",
        cell: (info) => (
            <div className="flex h-full min-h-12 items-center px-4 font-mono text-sm text-muted-foreground">
                {info.getValue()}
            </div>
        ),
    }),

    columnHelper.display({
        id: "supplier",
        header: "Supplier",
        cell: ({ row }) => {
            const quotes = row.original.supplierQuotes;
            if (quotes.length === 0) {
                return (
                    <div className="flex min-h-12 items-center px-4 font-sans text-sm text-muted-foreground/50 italic">
                        No quotes
                    </div>
                );
            }
            return (
                <div className="flex w-full flex-col divide-y divide-border/60">
                    {quotes.map((quote) => (
                        <div
                            key={quote.id}
                            className="flex min-h-12 items-center px-4 font-sans text-sm text-foreground"
                        >
                            {quote.supplier.name}
                        </div>
                    ))}
                </div>
            );
        },
    }),

    columnHelper.display({
        id: "truePrice",
        header: "True Price",
        cell: ({ row }) => {
            const unit = row.original.unit;
            const quotes = row.original.supplierQuotes;
            if (quotes.length === 0) return <div className="min-h-12" />;
            return (
                <div className="flex w-full flex-col divide-y divide-border/60">
                    {quotes.map((quote) => (
                        <div
                            key={quote.id}
                            className="flex min-h-12 items-center px-4 font-mono text-sm text-foreground tabular-nums"
                        >
                            {Number(quote.truePrice).toLocaleString()}/{unit}
                        </div>
                    ))}
                </div>
            );
        },
    }),

    columnHelper.display({
        id: "standardRate",
        header: "Standard Rate",
        cell: ({ row }) => {
            const unit = row.original.unit;
            const quotes = row.original.supplierQuotes;
            if (quotes.length === 0) return <div className="min-h-12" />;
            return (
                <div className="flex w-full flex-col divide-y divide-border/60">
                    {quotes.map((quote) => (
                        <div
                            key={quote.id}
                            className="flex min-h-12 items-center px-4 font-mono text-sm text-foreground tabular-nums"
                        >
                            {Number(quote.standardRate).toLocaleString()}/{unit}
                        </div>
                    ))}
                </div>
            );
        },
    }),

    columnHelper.display({
        id: "leadTime",
        header: "Lead Time",
        cell: ({ row }) => {
            const quotes = row.original.supplierQuotes;
            if (quotes.length === 0) return <div className="min-h-12" />;
            return (
                <div className="flex w-full flex-col divide-y divide-border/60">
                    {quotes.map((quote) => (
                        <div
                            key={quote.id}
                            className="flex min-h-12 items-center px-4 font-mono text-sm text-muted-foreground tabular-nums"
                        >
                            {quote.leadTimeDays != null ? `${quote.leadTimeDays}d` : "—"}
                        </div>
                    ))}
                </div>
            );
        },
    }),

    columnHelper.display({
        id: "actions",
        header: "",
        cell: ({ row }) => (
            <div className="flex min-h-12 items-center px-3">
                <CatalogueActionButton catalogueId={row.original.id} />
            </div>
        ),
    }),
];
