import { createColumnHelper } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CatalogueInventoryLocation } from "../../hooks/useCatalogueInventoryLocations";

const col = createColumnHelper<CatalogueInventoryLocation>();

export const catalogueLocationColumns = [
    col.accessor("name", {
        header: "Location Name",
        cell: (info) => (
            <div className="space-y-0.5">
                <p className="font-medium text-foreground">{info.getValue()}</p>
                {info.row.original.code && (
                    <p className="text-xs font-mono text-muted-foreground">
                        {info.row.original.code}
                    </p>
                )}
            </div>
        ),
    }),
    col.accessor("type", {
        header: "Type",
        cell: (info) => {
            const type = info.getValue();

            return (
                <Badge
                    variant="outline"
                    className={cn(
                        "rounded text-[10px] font-semibold uppercase tracking-wide",
                        type === "WAREHOUSE"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-sky-200 bg-sky-50 text-sky-700",
                    )}
                >
                    {type === "WAREHOUSE" ? "Warehouse" : "Project"}
                </Badge>
            );
        },
    }),
    col.accessor("quantityStored", {
        header: "Quantity Stored",
        cell: (info) => (
            <span className="font-mono font-semibold tabular-nums">
                {info.getValue().toLocaleString("en-IN")}
            </span>
        ),
    }),
    col.accessor("lastUpdatedAt", {
        header: "Last Updated",
        cell: (info) => (
            <span className="font-mono text-sm tabular-nums text-muted-foreground">
                {new Date(info.getValue()).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                })}
            </span>
        ),
    }),
];
