import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/Avatar";
import {
    useGetSupplierQuoteDetail,
    type SupplierQuote,
    type SupplierQuoteHistoryEntry,
} from "../../hooks/useSupplierQuotes";

interface QuoteAccordionContentProps {
    quoteId: string;
}

export function QuoteAccordionContent({ quoteId }: QuoteAccordionContentProps) {
    const { data, isLoading } = useGetSupplierQuoteDetail(quoteId, true);
    const detail = data?.data;

    if (isLoading || !detail) return <TimelineSkeleton />;

    return <AuditTimeline currentQuote={detail} history={detail.history} />;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface DiffEntry {
    id: string;
    changedAt: string;
    changedBy: { username: string; profileImage: string | null } | null;
    changeReason: string | null;
    isOptimistic: boolean;
    diffs: { field: string; from: number | null; to: number | null; isLeadTime: boolean }[];
}

// ─── Diff builder ─────────────────────────────────────────────────────────────

function buildDiffs(
    current: { truePrice: number; standardRate: number; leadTime: number | null },
    history: SupplierQuoteHistoryEntry[],
): DiffEntry[] {
    return history.map((entry, index) => {
        const newer =
            index === 0
                ? current
                : {
                      truePrice: history[index - 1].truePrice,
                      standardRate: history[index - 1].standardRate,
                      leadTime: history[index - 1].leadTime,
                  };

        const diffs: DiffEntry["diffs"] = [];
        if (newer.truePrice !== entry.truePrice)
            diffs.push({ field: "True Price", from: entry.truePrice, to: newer.truePrice, isLeadTime: false });
        if (newer.standardRate !== entry.standardRate)
            diffs.push({ field: "Std. Rate", from: entry.standardRate, to: newer.standardRate, isLeadTime: false });
        if (newer.leadTime !== entry.leadTime)
            diffs.push({ field: "Lead Time", from: entry.leadTime, to: newer.leadTime, isLeadTime: true });

        return {
            id: entry.id,
            changedAt: entry.changedAt,
            changedBy: entry.changedBy,
            changeReason: entry.changeReason,
            isOptimistic: entry.id.startsWith("optimistic-"),
            diffs,
        };
    });
}

// ─── Timeline root ────────────────────────────────────────────────────────────

function AuditTimeline({
    currentQuote,
    history,
}: {
    currentQuote: SupplierQuote;
    history: SupplierQuoteHistoryEntry[];
}) {
    const entries = buildDiffs(currentQuote, history);

    return (
        <div className="px-6 pt-4 pb-5 border-t border-border bg-background">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/60 mb-5">
                Price History
            </p>

            {entries.length === 0 ? (
                <div className="flex items-center gap-2 py-3">
                    <div className="size-1.5 rounded-full bg-border" />
                    <p className="text-xs text-muted-foreground">No changes recorded yet.</p>
                </div>
            ) : (
                <ol className="relative">
                    <div className="absolute left-[5px] top-[10px] bottom-[10px] w-px bg-border" />
                    {entries.map((entry, index) => (
                        <TimelineEntry
                            key={entry.id}
                            entry={entry}
                            isLast={index === entries.length - 1}
                        />
                    ))}
                </ol>
            )}
        </div>
    );
}

// ─── Single timeline entry ────────────────────────────────────────────────────

function TimelineEntry({ entry, isLast }: { entry: DiffEntry; isLast: boolean }) {
    const date = new Date(entry.changedAt);
    const dateStr = date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
    const timeStr = date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });

    return (
        <li className={cn("relative flex gap-4 pl-7", !isLast && "pb-6")}>
            {/* Dot */}
            <div
                className={cn(
                    "absolute left-0 top-[7px] size-[11px] rounded-full border-2 border-background ring-1",
                    entry.isOptimistic
                        ? "bg-amber-400 ring-amber-300"
                        : "bg-border ring-border",
                )}
            />

            <div className="flex-1 min-w-0 space-y-2.5">
                {/* ── Meta row ── */}
                <div className="flex items-center gap-2.5 flex-wrap">
                    {/* Author — animates from "You" placeholder to real identity */}
                    <AuthorSlot entry={entry} />

                    <span className="size-0.5 rounded-full bg-muted-foreground/30 shrink-0" />

                    <span className="text-[11px] text-muted-foreground tabular-nums">{dateStr}</span>
                    <span className="text-[11px] text-muted-foreground/50 tabular-nums">{timeStr}</span>

                    {entry.isOptimistic && (
                        <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                            saving…
                        </span>
                    )}
                </div>

                {/* ── Diff chips ── */}
                {entry.diffs.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {entry.diffs.map((diff) => (
                            <DiffChip key={diff.field} diff={diff} />
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-muted-foreground">No field changes.</p>
                )}

                {entry.changeReason && (
                    <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                        "{entry.changeReason}"
                    </p>
                )}
            </div>
        </li>
    );
}

// ─── Author slot ──────────────────────────────────────────────────────────────
// While optimistic: shows plain "You" text.
// Once resolved (changedBy populated): fades the avatar + username in.
// The key on the resolved state forces a fresh mount → triggers the fade-in.

function AuthorSlot({ entry }: { entry: DiffEntry }) {
    if (entry.isOptimistic) {
        // Optimistic placeholder — no avatar, just "You"
        return (
            <span className="text-xs font-semibold text-foreground leading-none">
                You
            </span>
        );
    }

    if (entry.changedBy) {
        // Real data arrived — fade the identity in
        return (
            <span
                key={entry.changedBy.username}
                className="flex items-center gap-1.5 animate-in fade-in duration-500"
            >
                <UserAvatar
                    name={entry.changedBy.username}
                    image={entry.changedBy.profileImage}
                    className="size-5"
                />
                <span className="text-xs font-semibold text-foreground leading-none">
                    {entry.changedBy.username}
                </span>
            </span>
        );
    }

    // No author info at all
    return (
        <span className="text-xs text-muted-foreground italic">Unknown</span>
    );
}

// ─── Diff chip ────────────────────────────────────────────────────────────────

function DiffChip({
    diff,
}: {
    diff: { field: string; from: number | null; to: number | null; isLeadTime: boolean };
}) {
    const fmt = (v: number | null) => {
        if (v === null) return "—";
        if (diff.isLeadTime) return `${v}d`;
        return `₹${v.toLocaleString("en-IN")}`;
    };

    const delta = diff.to !== null && diff.from !== null ? diff.to - diff.from : null;
    const isIncrease = delta !== null && delta > 0;
    const isDecrease = delta !== null && delta < 0;

    let arrow: string | null = null;
    if (isIncrease) arrow = "▲";
    else if (isDecrease) arrow = "▼";

    const isPrice = !diff.isLeadTime;

    return (
        <span
            className={cn(
                "inline-grid grid-cols-[auto_auto_auto_auto] items-center gap-x-1.5",
                "rounded-md border px-2.5 py-1.5 text-xs",
                isPrice && isIncrease && "bg-red-50 border-red-100",
                isPrice && isDecrease && "bg-emerald-50 border-emerald-100",
                (!isPrice || (!isIncrease && !isDecrease)) && "bg-muted/60 border-border",
            )}
        >
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {diff.field}
            </span>
            <span className="font-mono tabular-nums text-muted-foreground/50 line-through text-[11px]">
                {fmt(diff.from)}
            </span>
            <span className="text-muted-foreground/30 text-[10px]">→</span>
            <span className="flex items-center gap-1">
                <span
                    className={cn(
                        "font-mono tabular-nums font-semibold text-[12px]",
                        isPrice && isIncrease && "text-red-600",
                        isPrice && isDecrease && "text-emerald-600",
                        (!isPrice || (!isIncrease && !isDecrease)) && "text-foreground",
                    )}
                >
                    {fmt(diff.to)}
                </span>
                {arrow && delta !== null && (
                    <span
                        className={cn(
                            "inline-flex items-center gap-0.5 font-mono tabular-nums text-[10px] font-bold",
                            isIncrease ? "text-red-500" : "text-emerald-600",
                        )}
                    >
                        {arrow}
                        <span>
                            {diff.isLeadTime
                                ? `${Math.abs(delta)}d`
                                : `₹${Math.abs(delta).toLocaleString("en-IN")}`}
                        </span>
                    </span>
                )}
            </span>
        </span>
    );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function TimelineSkeleton() {
    return (
        <div className="px-6 pt-4 pb-5 border-t border-border bg-background space-y-6">
            {[1, 2].map((i) => (
                <div key={i} className="pl-7 space-y-2.5">
                    <div className="flex items-center gap-2">
                        <Skeleton className="size-5 rounded-full" />
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-7 w-36 rounded-md" />
                        <Skeleton className="h-7 w-28 rounded-md" />
                    </div>
                </div>
            ))}
        </div>
    );
}
