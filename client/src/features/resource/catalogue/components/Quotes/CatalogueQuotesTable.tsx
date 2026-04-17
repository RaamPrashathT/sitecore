import { useState } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    flexRender,
} from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type SupplierQuotesListItem } from "../../hooks/useSupplierQuotes";
import { quoteColumns, COLUMN_WIDTHS, fmt } from "./CatalogueQuotesColumns";
import { QuoteEditRow } from "./QuoteEditRow";
import { QuoteAccordionContent } from "./QuoteAccordionContent";

interface CatalogueQuotesTableProps {
    data: SupplierQuotesListItem[];
    globalFilter: string;
}

export function CatalogueQuotesTable({ data, globalFilter }: CatalogueQuotesTableProps) {
    // Multiple rows can be editing simultaneously — track as a Set
    const [editingIds, setEditingIds] = useState<Set<string>>(new Set());

    const table = useReactTable({
        data,
        columns: quoteColumns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: { globalFilter },
        globalFilterFn: "includesString",
    });

    const rows = table.getRowModel().rows;

    const startEdit = (id: string) => setEditingIds((prev) => new Set(prev).add(id));
    const stopEdit = (id: string) =>
        setEditingIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });

    if (rows.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-14 text-center">
                <p className="text-sm font-medium text-foreground mb-1">
                    {globalFilter ? "No suppliers match your filter" : "No quotes yet"}
                </p>
                <p className="text-xs text-muted-foreground">
                    {globalFilter
                        ? "Try a different search term."
                        : "Add the first supplier quote to start tracking pricing."}
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-lg border border-border overflow-hidden">
            {/* ── Table header ── */}
            <div className={cn("grid bg-muted/40 border-b border-border", COLUMN_WIDTHS)}>
                {table.getHeaderGroups()[0]?.headers.map((header) => (
                    <div
                        key={header.id}
                        className={cn(
                            "px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
                            header.id === "actions" && "text-right",
                        )}
                    >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                    </div>
                ))}
            </div>

            {/* ── Rows via Accordion (type="multiple" → any number open at once) ── */}
            <Accordion type="multiple" className="divide-y divide-border">
                {rows.map((row) => {
                    const quote = row.original;
                    const isEditing = editingIds.has(quote.id);
                    const profit = quote.standardRate - quote.truePrice;

                    return (
                        <AccordionItem
                            key={quote.id}
                            value={quote.id}
                            className="border-0"
                        >
                            {/* AccordionTrigger is ALWAYS present — edit panel sits below it */}
                            <AccordionTrigger
                                className={cn(
                                    "hover:no-underline hover:bg-muted/10 transition-colors p-0",
                                    "[&>svg]:hidden",
                                    isEditing && "bg-muted/10",
                                )}
                            >
                                <div className={cn("grid w-full items-center", COLUMN_WIDTHS)}>
                                    {/* Supplier */}
                                    <div className="px-4 py-3.5 text-left">
                                        <span className="text-sm font-medium text-foreground">
                                            {quote.supplier.name}
                                        </span>
                                    </div>

                                    {/* True Price */}
                                    <div className="px-4 py-3.5 text-left">
                                        <span className="text-sm font-mono tabular-nums">
                                            {fmt.price(quote.truePrice)}
                                        </span>
                                    </div>

                                    {/* Std Rate */}
                                    <div className="px-4 py-3.5 text-left">
                                        <span className="text-sm font-mono tabular-nums text-muted-foreground">
                                            {fmt.price(quote.standardRate)}
                                        </span>
                                    </div>

                                    {/* Margin */}
                                    <div className="px-4 py-3.5 text-left">
                                        <span className={fmt.marginColor(profit)}>
                                            {fmt.margin(profit)}
                                        </span>
                                    </div>

                                    {/* Lead Time */}
                                    <div className="px-4 py-3.5 text-left">
                                        <span className="text-sm font-mono tabular-nums text-muted-foreground">
                                            {fmt.leadTime(quote.leadTime)}
                                        </span>
                                    </div>

                                    {/* Actions — edit button + accordion chevron */}
                                    <div className="px-3 py-3.5 flex items-center justify-end gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                            onClick={(e) => {
                                                e.stopPropagation(); // don't trigger accordion
                                                startEdit(quote.id);
                                            }}
                                            title="Edit"
                                        >
                                            <Pencil className="size-3.5" />
                                        </Button>
                                        {/* Chevron rendered manually so it sits inside the grid */}
                                        <AccordionChevron />
                                    </div>
                                </div>
                            </AccordionTrigger>

                            {/* Edit panel — below the trigger row, independent of accordion state */}
                            {isEditing && (
                                <QuoteEditRow quote={quote} onDone={() => stopEdit(quote.id)} />
                            )}

                            <AccordionContent className="p-0 pb-0">
                                <QuoteAccordionContent quoteId={quote.id} />
                            </AccordionContent>
                        </AccordionItem>
                    );
                })}
            </Accordion>
        </div>
    );
}

// Renders the rotating chevron that shadcn normally injects — we need it
// inside the grid cell so it aligns with the actions column.
function AccordionChevron() {
    return (
        <span
            className={cn(
                "flex items-center justify-center h-7 w-7 rounded-sm",
                "text-muted-foreground transition-colors hover:text-foreground",
                // shadcn rotates [&>svg] on the trigger; we replicate that here
                // by targeting the parent AccordionItem's data-state
                "[data-state=open]_&>svg:rotate-180",
            )}
            aria-hidden
        >
            {/* Inline SVG so we can target it with the parent data-state */}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-200 in-data-[state=open]:rotate-180"
            >
                <path d="m6 9 6 6 6-6" />
            </svg>
        </span>
    );
}
