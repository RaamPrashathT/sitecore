/* eslint-disable react-refresh/only-export-components */
import type { ComponentType } from "react";
import {
    ArrowDownToLine,
    ArrowRightLeft,
    ArrowDown,
    ArrowUp,
    Minus,
    RotateCcw,
    SlidersHorizontal,
} from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
    CatalogueMovementEventType,
    CatalogueMovementLogEntry,
} from "./CatalogueLogsMain";

const col = createColumnHelper<CatalogueMovementLogEntry>();

export const catalogueLogsColumns = [
    col.accessor("movementDate", {
        header: "Date",
        cell: (info) => <DateCell value={info.getValue()} />,
    }),
    col.accessor("label", {
        header: "Event",
        cell: (info) => <EventCell log={info.row.original} />,
    }),
    col.display({
        id: "locations",
        header: "Locations",
        cell: (info) => <LocationFlow log={info.row.original} />,
    }),
    col.accessor("quantity", {
        header: "Quantity",
        cell: (info) => <QuantityCell log={info.row.original} />,
    }),
    col.accessor("remarks", {
        header: "Notes",
        cell: (info) => <NotesCell value={info.getValue()} />,
    }),
];

function DateCell({ value }: { value: string }) {
    const date = new Date(value);

    return (
        <div className="space-y-0.5 whitespace-nowrap">
            <p className="font-mono text-sm font-normal leading-5 tabular-nums text-foreground">
                {date.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                })}
            </p>
            <p className="font-mono text-[11px] font-normal leading-4 tabular-nums text-muted-foreground/75">
                {date.toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                })}
            </p>
        </div>
    );
}

function EventCell({ log }: { log: CatalogueMovementLogEntry }) {
    return <EventTypeBadge eventType={log.eventType} />;
}

function EventTypeBadge({ eventType }: { eventType: CatalogueMovementEventType }) {
    const Icon = EVENT_BADGE_META[eventType].icon;
    const meta = EVENT_BADGE_META[eventType];

    return (
        <span
            className={cn(
                "inline-flex h-7 min-w-32 shrink-0 items-center gap-1.5 rounded border px-2 text-[11px] font-bold uppercase tracking-wide",
                meta.className,
            )}
        >
            <Icon className="size-3.5" />
            {meta.label}
        </span>
    );
}

function LocationFlow({ log }: { log: CatalogueMovementLogEntry }) {
    if (log.fromLocation && log.toLocation) {
        return (
            <div className="min-w-64 space-y-1.5">
                <LocationLine
                    direction="from"
                    name={log.fromLocation.name}
                    type={log.fromLocation.type}
                />
                <LocationLine
                    direction="to"
                    name={log.toLocation.name}
                    type={log.toLocation.type}
                />
            </div>
        );
    }

    if (log.fromLocation) {
        return (
            <LocationLine
                direction="from"
                name={log.fromLocation.name}
                type={log.fromLocation.type}
            />
        );
    }

    if (log.toLocation) {
        return (
            <LocationLine
                direction="to"
                name={log.toLocation.name}
                type={log.toLocation.type}
            />
        );
    }

    return <span className="text-sm text-muted-foreground">No location</span>;
}

function NotesCell({ value }: { value: string | null }) {
    if (!value) {
        return <span className="text-sm text-muted-foreground/70">-</span>;
    }

    return (
        <span
            title={value}
            className="block max-w-[18rem] overflow-hidden text-ellipsis whitespace-nowrap text-sm text-muted-foreground"
        >
            {value}
        </span>
    );
}

function QuantityCell({ log }: { log: CatalogueMovementLogEntry }) {
    return (
        <div className="text-right font-mono tabular-nums">
            <span className="text-sm font-bold text-foreground">
                {log.quantity.toLocaleString("en-IN")}
            </span>
            <span className="ml-1 text-[11px] font-medium text-muted-foreground">
                {log.unit}
            </span>
        </div>
    );
}

function LocationLine({
    direction,
    name,
    type,
}: {
    direction: "from" | "to";
    name: string;
    type: string;
}) {
    const Icon = direction === "from" ? ArrowUp : ArrowDown;

    return (
        <div className="flex min-w-0 items-center gap-1.5">
            <Icon className="size-3 shrink-0 text-muted-foreground" />
            <span className="truncate text-sm font-medium text-foreground">{name}</span>
            <LocationTypeBadge type={type} />
        </div>
    );
}

function LocationTypeBadge({ type }: { type: string }) {
    return (
        <Badge
            variant="outline"
            className="h-5 shrink-0 rounded px-1.5 text-[10px] font-semibold text-muted-foreground"
        >
            {type === "WAREHOUSE" ? "WH" : "PR"}
        </Badge>
    );
}

const EVENT_BADGE_META: Record<
    CatalogueMovementEventType,
    {
        label: string;
        icon: ComponentType<{ className?: string }>;
        className: string;
    }
> = {
    RECEIPT: {
        label: "Receipt",
        icon: ArrowDownToLine,
        className: "border-emerald-200 bg-emerald-50 text-emerald-800",
    },
    TRANSFER: {
        label: "Transfer",
        icon: ArrowRightLeft,
        className: "border-sky-200 bg-sky-50 text-sky-800",
    },
    ADJUSTMENT: {
        label: "Adjustment",
        icon: SlidersHorizontal,
        className: "border-amber-200 bg-amber-50 text-amber-800",
    },
    ISSUE: {
        label: "Issue",
        icon: Minus,
        className: "border-red-200 bg-red-50 text-red-800",
    },
    RETURN: {
        label: "Return",
        icon: RotateCcw,
        className: "border-purple-200 bg-purple-50 text-purple-800",
    },
};
