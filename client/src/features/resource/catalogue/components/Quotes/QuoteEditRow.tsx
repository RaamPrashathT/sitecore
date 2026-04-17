import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useUpdateQuote, type SupplierQuotesListItem } from "../../hooks/useSupplierQuotes";
import { fmt } from "./CatalogueQuotesColumns";

interface QuoteEditRowProps {
    quote: SupplierQuotesListItem;
    onDone: () => void;
}

/**
 * Renders as a vertically-expanding panel *below* the AccordionTrigger row.
 * The trigger stays mounted so the accordion still opens/closes independently.
 */
export function QuoteEditRow({ quote, onDone }: QuoteEditRowProps) {
    const [truePrice, setTruePrice] = useState(String(quote.truePrice));
    const [standardRate, setStandardRate] = useState(String(quote.standardRate));
    const [leadTime, setLeadTime] = useState(quote.leadTime === null ? "" : String(quote.leadTime));
    const [changeReason, setChangeReason] = useState("");

    const update = useUpdateQuote(quote.id);

    // Live-calculated margin from current input values
    const tp = Number.parseFloat(truePrice);
    const sr = Number.parseFloat(standardRate);
    const liveMargin = !Number.isNaN(tp) && !Number.isNaN(sr) ? sr - tp : null;

    // Detect whether anything actually changed from the original quote values
    const lt = leadTime.trim() === "" ? null : Number.parseInt(leadTime, 10);
    const hasChanges =
        !Number.isNaN(tp) &&
        !Number.isNaN(sr) &&
        (tp !== quote.truePrice || sr !== quote.standardRate || lt !== quote.leadTime);

    const handleSave = () => {
        if (!hasChanges) return;
        update.mutate(
            { truePrice: tp, standardRate: sr, leadTime: lt, changeReason: changeReason.trim() || null },
            { onSuccess: onDone },
        );
    };

    return (
        <div className="border-t border-border bg-muted/5 px-4 py-4 space-y-4">
            {/* ── Row 1: inputs ── */}
            <div className="flex items-end gap-3 flex-wrap">
                <PriceInput
                    id={`tp-${quote.id}`}
                    label="True Price"
                    value={truePrice}
                    onChange={setTruePrice}
                    prefix="₹"
                />
                <PriceInput
                    id={`sr-${quote.id}`}
                    label="Std. Rate"
                    value={standardRate}
                    onChange={setStandardRate}
                    prefix="₹"
                />

                {/* Live margin — read-only, updates as user types */}
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                        Margin
                    </span>
                    <div className="h-8 px-3 flex items-center rounded-md border border-border bg-muted/40 min-w-[88px]">
                        {liveMargin === null ? (
                            <span className="text-xs text-muted-foreground font-mono">—</span>
                        ) : (
                            <span
                                className={cn(
                                    "text-xs font-mono tabular-nums font-semibold",
                                    liveMargin >= 0 ? "text-emerald-600" : "text-red-500",
                                )}
                            >
                                {fmt.price(liveMargin)}
                            </span>
                        )}
                    </div>
                </div>

                <PriceInput
                    id={`lt-${quote.id}`}
                    label="Lead Time"
                    value={leadTime}
                    onChange={setLeadTime}
                    suffix="d"
                    placeholder="—"
                />
            </div>

            {/* ── Row 2: reason textarea ── */}
            <div className="flex flex-col gap-1.5">
                <label
                    htmlFor={`cr-${quote.id}`}
                    className="text-[10px] text-muted-foreground uppercase tracking-wide"
                >
                    Reason for change
                </label>
                <Textarea
                    id={`cr-${quote.id}`}
                    value={changeReason}
                    onChange={(e) => setChangeReason(e.target.value)}
                    placeholder="Describe why these rates are changing — e.g. supplier revised pricing for Q3."
                    className="text-xs resize-none min-h-[64px]"
                    rows={2}
                />
            </div>

            {/* ── Row 3: note + actions ── */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <AlertCircle className="size-3 shrink-0" />
                    <span>
                        Changes are permanent and will appear in the audit timeline immediately.
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-3 text-xs"
                        onClick={onDone}
                        disabled={update.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        className="h-7 px-3 text-xs"
                        onClick={handleSave}
                        disabled={update.isPending || !hasChanges}
                        title={!hasChanges ? "No changes to save" : undefined}
                    >
                        {update.isPending ? "Saving…" : "Save changes"}
                    </Button>
                </div>
            </div>
        </div>
    );
}

// ─── Shared numeric input with optional prefix/suffix ─────────────────────────

function PriceInput({
    id,
    label,
    value,
    onChange,
    prefix,
    suffix,
    placeholder,
}: {
    id: string;
    label: string;
    value: string;
    onChange: (v: string) => void;
    prefix?: string;
    suffix?: string;
    placeholder?: string;
}) {
    return (
        <div className="flex flex-col gap-1">
            <label htmlFor={id} className="text-[10px] text-muted-foreground uppercase tracking-wide">
                {label}
            </label>
            <div className="relative flex items-center">
                {prefix && (
                    <span className="absolute left-2.5 text-xs text-muted-foreground pointer-events-none select-none">
                        {prefix}
                    </span>
                )}
                <Input
                    id={id}
                    type="number"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={cn(
                        "h-8 text-sm font-mono w-28",
                        prefix && "pl-6",
                        suffix && "pr-6",
                    )}
                />
                {suffix && (
                    <span className="absolute right-2.5 text-xs text-muted-foreground pointer-events-none select-none">
                        {suffix}
                    </span>
                )}
            </div>
        </div>
    );
}
