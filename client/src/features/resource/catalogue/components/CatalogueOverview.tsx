import { useGetCatalogueItem } from "../hooks/useGetCatalogueItem";
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

const CatalogueOverview = () => {
    const { data, isLoading } = useGetCatalogueItem();
    const item = data?.data;

    if (isLoading) return <CatalogueOverviewSkeleton />;
    if (!item) return null;

    const { stockSummary, supplierSummary } = item;

    return (
        <div className="space-y-10">
            {/* Stat strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border rounded-lg overflow-hidden border border-border">
                <StatCell label="Unit" value={item.unit} mono />
                <StatCell
                    label="Default Lead Time"
                    value={`${item.defaultLeadTime}d`}
                    mono
                />
                <StatCell
                    label="Active Suppliers"
                    value={String(supplierSummary.activeSuppliersCount)}
                    mono
                />
                <StatCell
                    label="Total Stock"
                    value={`${stockSummary.totalQuantity} ${item.unit}`}
                    mono
                    highlight={stockSummary.totalQuantity > 0}
                />
            </div>

            {/* Stock table */}
            <section className="space-y-3">
                <SectionLabel>Stock by Location</SectionLabel>
                {stockSummary.locations.length === 0 ? (
                    <EmptyRow message="No stock recorded across any location." />
                ) : (
                    <div className="rounded-lg border border-border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40 hover:bg-muted/40">
                                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide w-[40%]">
                                        Location
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                        Type
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                        Last Updated
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">
                                        Qty ({item.unit})
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stockSummary.locations.map((loc) => (
                                    <TableRow
                                        key={loc.locationId}
                                        className="hover:bg-muted/20"
                                    >
                                        <TableCell className="font-medium text-sm">
                                            {loc.locationName}
                                        </TableCell>
                                        <TableCell>
                                            <LocationTypePill
                                                type={loc.locationType}
                                            />
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground font-mono tabular-nums">
                                            {new Date(
                                                loc.locationUpdatedAt,
                                            ).toLocaleDateString("en-IN", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </TableCell>
                                        <TableCell className="text-right font-mono font-semibold tabular-nums text-sm">
                                            {loc.quantity.toLocaleString(
                                                "en-IN",
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </section>

            {/* Supplier quotes table */}
            <section className="space-y-3">
                <SectionLabel>Supplier Quotes</SectionLabel>
                {supplierSummary.quotes.length === 0 ? (
                    <EmptyRow message="No supplier quotes on record." />
                ) : (
                    <div className="rounded-lg border border-border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40 hover:bg-muted/40">
                                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide w-[35%]">
                                        Supplier
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">
                                        True Price
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">
                                        Std. Rate
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">
                                        Profit
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">
                                        Lead Time
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {supplierSummary.quotes.map((q) => {
                                    const profit = q.standardRate - q.truePrice;
                                    return (
                                        <TableRow
                                            key={q.id}
                                            className="hover:bg-muted/20"
                                        >
                                            <TableCell>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-medium text-sm">
                                                        {q.supplierName}
                                                    </span>
                                                    {q.isHighestProfit && (
                                                        <QuotePill
                                                            label="Highest profit"
                                                            variant="profit"
                                                        />
                                                    )}
                                                    {q.isShortestLeadTime && (
                                                        <QuotePill
                                                            label="Least lead time"
                                                            variant="speed"
                                                        />
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-mono tabular-nums text-sm">
                                                ₹{q.truePrice.toLocaleString("en-IN")}
                                            </TableCell>
                                            <TableCell className="text-right font-mono tabular-nums text-sm text-muted-foreground">
                                                ₹{q.standardRate.toLocaleString("en-IN")}
                                            </TableCell>
                                            <TableCell
                                                className={cn(
                                                    "text-right font-mono font-semibold tabular-nums text-sm",
                                                    profit > 0
                                                        ? "text-primary"
                                                        : "text-destructive",
                                                )}
                                            >
                                                ₹{profit.toLocaleString("en-IN")}
                                            </TableCell>
                                            <TableCell className="text-right font-mono tabular-nums text-sm text-muted-foreground">
                                                {q.leadTime === null
                                                    ? "—"
                                                    : `${q.leadTime}d`}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </section>
        </div>
    );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        {children}
    </h3>
);

const StatCell = ({
    label,
    value,
    mono = false,
    highlight = false,
}: {
    label: string;
    value: string;
    mono?: boolean;
    highlight?: boolean;
}) => (
    <div className="bg-background px-4 py-3 space-y-1">
        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {label}
        </p>
        <p
            className={cn(
                "text-base font-semibold leading-none",
                mono && "font-mono tabular-nums",
                highlight && "text-primary",
            )}
        >
            {value}
        </p>
    </div>
);

const LocationTypePill = ({ type }: { type: string }) => {
    const styles =
        type === "WAREHOUSE"
            ? "bg-stone-100 text-stone-600 border-stone-200"
            : "bg-blue-50 text-blue-600 border-blue-200";
    return (
        <span
            className={cn(
                "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide border",
                styles,
            )}
        >
            {type}
        </span>
    );
};

const QuotePill = ({
    label,
    variant,
}: {
    label: string;
    variant: "profit" | "speed";
}) => {
    const styles =
        variant === "profit"
            ? "bg-primary/8 text-primary border-primary/20"
            : "bg-amber-50 text-amber-700 border-amber-200";
    return (
        <span
            className={cn(
                "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border",
                styles,
            )}
        >
            {label}
        </span>
    );
};

const EmptyRow = ({ message }: { message: string }) => (
    <p className="text-sm text-muted-foreground py-2">{message}</p>
);

const CatalogueOverviewSkeleton = () => (
    <div className="space-y-10 max-w-4xl">
        <div className="grid grid-cols-4 gap-px bg-border rounded-lg overflow-hidden border border-border">
            {["a", "b", "c", "d"].map((k) => (
                <div key={k} className="bg-background px-4 py-3 space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-5 w-12" />
                </div>
            ))}
        </div>
        <div className="space-y-3">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-32 w-full rounded-lg" />
        </div>
        <div className="space-y-3">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-40 w-full rounded-lg" />
        </div>
    </div>
);

export default CatalogueOverview;
