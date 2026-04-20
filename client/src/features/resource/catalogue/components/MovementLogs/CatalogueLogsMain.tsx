/* eslint-disable react-hooks/incompatible-library */
import type { ReactNode } from "react";
import { Fragment } from "react";
import { useMemo, useState } from "react";
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { Check, ChevronDown, History, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
    useCatalogueInventoryMovements,
    type CatalogueInventoryMovement,
} from "../../hooks/useCatalogueInventoryMovements";
import { catalogueLogsColumns } from "./CatalogueLogsColumns";

type MovementLocation = { id: string; name: string; type: string };
export type CatalogueMovementEventType =
    | "RECEIPT"
    | "TRANSFER"
    | "ADJUSTMENT"
    | "ISSUE"
    | "RETURN";

export interface CatalogueMovementLogEntry {
    id: string;
    movementDate: string;
    eventType: CatalogueMovementEventType;
    label: string;
    detail: string;
    quantity: number;
    unit: string;
    remarks: string | null;
    fromLocation: MovementLocation | null;
    toLocation: MovementLocation | null;
    tone: "positive" | "negative" | "neutral";
    searchText: string;
}

export default function CatalogueLogsMain() {
    const [search, setSearch] = useState("");
    const [eventTypes, setEventTypes] = useState<CatalogueMovementEventType[]>([]);
    const [locationId, setLocationId] = useState("all");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const { data, isLoading } = useCatalogueInventoryMovements();
    const movements = useMemo(() => data?.data ?? [], [data?.data]);
    const logs = useMemo(() => buildLogs(movements), [movements]);
    const filteredLogs = useMemo(
        () =>
            logs.filter((log) => {
                const eventMatches =
                    eventTypes.length === 0 || eventTypes.includes(log.eventType);
                const locationMatches =
                    locationId === "all" ||
                    log.fromLocation?.id === locationId ||
                    log.toLocation?.id === locationId;
                const logDate = new Date(log.movementDate);
                const fromMatches =
                    !dateFrom || logDate >= startOfLocalDay(dateFrom);
                const toMatches = !dateTo || logDate <= endOfLocalDay(dateTo);

                return eventMatches && locationMatches && fromMatches && toMatches;
            }),
        [dateFrom, dateTo, eventTypes, locationId, logs],
    );
    const locations = useMemo(() => getLocationOptions(logs), [logs]);
    const transferCount = filteredLogs.filter(
        (log) => log.eventType === "TRANSFER",
    ).length;
    const hasFilters =
        search.length > 0 ||
        eventTypes.length > 0 ||
        locationId !== "all" ||
        dateFrom.length > 0 ||
        dateTo.length > 0;

    const table = useReactTable({
        data: filteredLogs,
        columns: catalogueLogsColumns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: { globalFilter: search },
        globalFilterFn: (row, _columnId, filterValue) =>
            row.original.searchText
                .toLowerCase()
                .includes(String(filterValue).toLowerCase()),
    });

    if (isLoading) return <CatalogueLogsSkeleton />;

    return (
        <div className="max-w-6xl space-y-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-prose space-y-1">
                    <h3 className="text-base font-semibold tracking-tight text-foreground">
                        Movement logs
                    </h3>
                    <p className="text-sm leading-6 text-muted-foreground">
                        A chronological ledger for transfers, reductions, receipts, returns, and stock corrections tied to this catalogue item.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border">
                    <MetricCell label="Entries" value={String(filteredLogs.length)} />
                    <MetricCell label="Transfers" value={String(transferCount)} />
                </div>
            </div>

            <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <History className="size-3.5" />
                    Latest activity first
                </div>
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search location, event, or note..."
                        className="h-8 pl-8 text-sm"
                    />
                </div>
            </div>

            <LogsFilterBar
                selectedEventTypes={eventTypes}
                onSelectedEventTypesChange={setEventTypes}
                locationId={locationId}
                onLocationIdChange={setLocationId}
                locations={locations}
                dateFrom={dateFrom}
                dateTo={dateTo}
                onDateFromChange={setDateFrom}
                onDateToChange={setDateTo}
                onReset={() => {
                    setSearch("");
                    setEventTypes([]);
                    setLocationId("all");
                    setDateFrom("");
                    setDateTo("");
                }}
                hasFilters={hasFilters}
            />

            <LogsTable table={table} search={search} hasFilters={hasFilters} />
        </div>
    );
}

function LogsFilterBar({
    selectedEventTypes,
    onSelectedEventTypesChange,
    locationId,
    onLocationIdChange,
    locations,
    dateFrom,
    dateTo,
    onDateFromChange,
    onDateToChange,
    onReset,
    hasFilters,
}: {
    selectedEventTypes: CatalogueMovementEventType[];
    onSelectedEventTypesChange: (value: CatalogueMovementEventType[]) => void;
    locationId: string;
    onLocationIdChange: (value: string) => void;
    locations: MovementLocation[];
    dateFrom: string;
    dateTo: string;
    onDateFromChange: (value: string) => void;
    onDateToChange: (value: string) => void;
    onReset: () => void;
    hasFilters: boolean;
}) {
    return (
        <div className="grid gap-3 rounded-lg border border-border bg-muted/20 p-3 lg:grid-cols-[minmax(220px,1fr)_minmax(220px,1fr)_minmax(260px,1.2fr)_auto] lg:items-end">
            <FilterBlock label="Event type">
                <EventTypeMultiSelect
                    selected={selectedEventTypes}
                    onChange={onSelectedEventTypesChange}
                />
            </FilterBlock>

            <FilterBlock label="Location">
                <select
                    value={locationId}
                    onChange={(event) => onLocationIdChange(event.target.value)}
                    className="h-8 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                    <option value="all">All locations</option>
                    {locations.map((location) => (
                        <option key={location.id} value={location.id}>
                            {location.name}
                        </option>
                    ))}
                </select>
            </FilterBlock>

            <FilterBlock label="Date range">
                <div className="grid grid-cols-2 gap-2">
                    <Input
                        type="date"
                        value={dateFrom}
                        onChange={(event) => onDateFromChange(event.target.value)}
                        className="h-8 text-sm"
                        aria-label="From date"
                    />
                    <Input
                        type="date"
                        value={dateTo}
                        onChange={(event) => onDateToChange(event.target.value)}
                        className="h-8 text-sm"
                        aria-label="To date"
                    />
                </div>
            </FilterBlock>

            <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 justify-self-start px-2 lg:justify-self-end"
                disabled={!hasFilters}
                onClick={onReset}
            >
                <X className="size-3.5" />
                Clear
            </Button>
        </div>
    );
}

function EventTypeMultiSelect({
    selected,
    onChange,
}: {
    selected: CatalogueMovementEventType[];
    onChange: (value: CatalogueMovementEventType[]) => void;
}) {
    const summary =
        selected.length === 0
            ? "All event types"
            : selected.length === 1
              ? EVENT_TYPE_LABELS[selected[0]]
              : `${selected.length} event types`;

    function toggle(eventType: CatalogueMovementEventType) {
        onChange(
            selected.includes(eventType)
                ? selected.filter((value) => value !== eventType)
                : [...selected, eventType],
        );
    }

    return (
        <details className="group relative">
            <summary className="flex h-8 w-full cursor-pointer list-none items-center justify-between rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
                <span>{summary}</span>
                <ChevronDown className="size-3.5 text-muted-foreground" />
            </summary>
            <div className="absolute left-0 top-10 z-40 w-64 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md">
                {EVENT_TYPE_OPTIONS.map((option) => {
                    const checked = selected.includes(option.value);
                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => toggle(option.value)}
                            className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                        >
                            <span className="flex size-4 items-center justify-center rounded border border-border">
                                {checked && <Check className="size-3" />}
                            </span>
                            <span>{option.label}</span>
                        </button>
                    );
                })}
            </div>
        </details>
    );
}

function FilterBlock({
    label,
    children,
}: {
    label: string;
    children: ReactNode;
}) {
    return (
        <label className="space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {label}
            </span>
            {children}
        </label>
    );
}

function LogsTable({
    table,
    search,
    hasFilters,
}: {
    table: ReturnType<typeof useReactTable<CatalogueMovementLogEntry>>;
    search: string;
    hasFilters: boolean;
}) {
    const rows = table.getRowModel().rows;

    if (rows.length === 0) {
        return (
            <div className="rounded-lg border border-dashed border-border px-6 py-12">
                <p className="text-sm font-semibold text-foreground">
                    {search ? "No matching logs" : "No movement logs yet"}
                </p>
                <p className="mt-1 max-w-prose text-sm text-muted-foreground">
                    {hasFilters || search
                        ? "Try another event type, location, date, or search term."
                        : "Transfers and reductions will appear here as soon as inventory starts moving."}
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-lg bg-background">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow
                            key={headerGroup.id}
                            className="border-b border-border bg-background hover:bg-background"
                        >
                            {headerGroup.headers.map((header) => (
                                <TableHead
                                    key={header.id}
                                    className={cn(
                                        "h-9 px-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground",
                                        header.id === "quantity" && "text-right",
                                    )}
                                >
                                    {flexRender(
                                        header.column.columnDef.header,
                                        header.getContext(),
                                    )}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {rows.map((row, index) => {
                        const currentDate = formatDateGroup(row.original.movementDate);
                        const previousDate =
                            index > 0
                                ? formatDateGroup(rows[index - 1].original.movementDate)
                                : null;
                        const showDateSeparator = currentDate !== previousDate;

                        return (
                            <Fragment key={row.id}>
                                {showDateSeparator && (
                                    <TableRow
                                        key={`${row.id}-date-${currentDate}`}
                                        className="border-0 hover:bg-background"
                                    >
                                        <TableCell
                                            colSpan={table.getAllLeafColumns().length}
                                            className="px-0 py-3"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="h-px flex-1 bg-border" />
                                                <span className="whitespace-nowrap font-mono text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                                    {currentDate}
                                                </span>
                                                <div className="h-px flex-1 bg-border" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                                <TableRow className="border-b border-border/70 hover:bg-muted/20">
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="px-3 py-3 align-middle">
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </Fragment>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}

function buildLogs(
    movements: CatalogueInventoryMovement[],
): CatalogueMovementLogEntry[] {
    const transferGroups = new Map<string, CatalogueInventoryMovement[]>();
    const directMovements: CatalogueInventoryMovement[] = [];

    movements.forEach((movement) => {
        if (
            movement.transferGroupId &&
            (movement.type === "TRANSFER_IN" || movement.type === "TRANSFER_OUT")
        ) {
            const group = transferGroups.get(movement.transferGroupId) ?? [];
            group.push(movement);
            transferGroups.set(movement.transferGroupId, group);
            return;
        }

        directMovements.push(movement);
    });

    const transferLogs = Array.from(transferGroups.entries()).map(([id, group]) => {
        const out = group.find((movement) => movement.type === "TRANSFER_OUT");
        const into = group.find((movement) => movement.type === "TRANSFER_IN");
        const primary = out ?? into ?? group[0];

        return createLogEntry({
            id,
            movementDate: primary.movementDate,
            eventType: "TRANSFER",
            label: "Transfer",
            detail: "Moved between locations",
            quantity: primary.quantity,
            unit: primary.catalogue.unit,
            remarks: primary.remarks,
            fromLocation: out?.fromLocation ?? null,
            toLocation: into?.toLocation ?? null,
            tone: "neutral",
        });
    });

    const directLogs = directMovements.map((movement) =>
        createLogEntry({
            id: movement.id,
            movementDate: movement.movementDate,
            eventType: movementEventType(movement.type),
            ...movementCopy(movement),
            quantity: movement.quantity,
            unit: movement.catalogue.unit,
            remarks: movement.remarks,
            fromLocation: movement.fromLocation,
            toLocation: movement.toLocation,
        }),
    );

    return [...transferLogs, ...directLogs].sort(
        (a, b) =>
            new Date(b.movementDate).getTime() - new Date(a.movementDate).getTime(),
    );
}

function movementEventType(
    type: CatalogueInventoryMovement["type"],
): CatalogueMovementEventType {
    if (type.startsWith("TRANSFER")) return "TRANSFER";
    if (type.startsWith("ADJUSTMENT")) return "ADJUSTMENT";
    if (type.startsWith("RETURN")) return "RETURN";
    if (type === "ISSUE") return "ISSUE";
    return "RECEIPT";
}

function movementCopy(movement: CatalogueInventoryMovement): {
    label: string;
    detail: string;
    tone: CatalogueMovementLogEntry["tone"];
} {
    switch (movement.type) {
        case "RECEIPT":
        case "RETURN_IN":
        case "ADJUSTMENT_ADD":
            return { label: "Stock added", detail: movementLabel(movement.type), tone: "positive" };
        case "ISSUE":
        case "RETURN_OUT":
        case "ADJUSTMENT_SUB":
            return { label: "Stock reduced", detail: movementLabel(movement.type), tone: "negative" };
        default:
            return { label: "Movement", detail: movementLabel(movement.type), tone: "neutral" };
    }
}

function movementLabel(type: CatalogueInventoryMovement["type"]) {
    return type
        .toLowerCase()
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function createLogEntry(
    log: Omit<CatalogueMovementLogEntry, "searchText">,
): CatalogueMovementLogEntry {
    const searchText = [
        log.label,
        log.eventType,
        log.detail,
        log.remarks,
        log.fromLocation?.name,
        log.fromLocation?.type,
        log.toLocation?.name,
        log.toLocation?.type,
        log.quantity,
        log.unit,
    ]
        .filter(Boolean)
        .join(" ");

    return { ...log, searchText };
}

function getLocationOptions(logs: CatalogueMovementLogEntry[]) {
    const byId = new Map<string, MovementLocation>();

    logs.forEach((log) => {
        if (log.fromLocation) byId.set(log.fromLocation.id, log.fromLocation);
        if (log.toLocation) byId.set(log.toLocation.id, log.toLocation);
    });

    return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function startOfLocalDay(value: string) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day, 0, 0, 0, 0);
}

function endOfLocalDay(value: string) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day, 23, 59, 59, 999);
}

function formatDateGroup(value: string) {
    return new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function MetricCell({ label, value }: { label: string; value: string }) {
    return (
        <div className="min-w-28 bg-background px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {label}
            </p>
            <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-foreground">
                {value}
            </p>
        </div>
    );
}

const EVENT_TYPE_LABELS: Record<CatalogueMovementEventType, string> = {
    RECEIPT: "Receipt",
    TRANSFER: "Transfer",
    ADJUSTMENT: "Adjustment",
    ISSUE: "Issue",
    RETURN: "Return",
};

const EVENT_TYPE_OPTIONS: Array<{
    value: CatalogueMovementEventType;
    label: string;
}> = [
    { value: "RECEIPT", label: "Receipt" },
    { value: "TRANSFER", label: "Transfer" },
    { value: "ADJUSTMENT", label: "Adjustment" },
    { value: "ISSUE", label: "Issue" },
    { value: "RETURN", label: "Return" },
];

function CatalogueLogsSkeleton() {
    return (
        <div className="max-w-6xl space-y-5">
            <div className="flex items-end justify-between gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-5 w-36" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <Skeleton className="h-16 w-56" />
            </div>
            <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-80" />
            </div>
            <div className="rounded-lg border border-border">
                <div className="border-b border-border bg-muted/40 px-4 py-3">
                    <Skeleton className="h-3 w-full" />
                </div>
                {[1, 2, 3, 4].map((row) => (
                    <div key={row} className="border-b border-border px-4 py-4 last:border-0">
                        <Skeleton className="h-8 w-full" />
                    </div>
                ))}
            </div>
        </div>
    );
}
