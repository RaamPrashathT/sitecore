import { useRef } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGetCatalogueById } from "../hooks/useCatalogue";
import { ArrowLeft, MoreVertical, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useContainerLenis } from "@/hooks/useContainerLenis";

interface CatalogueSheetProps {
    readonly catalogueId: string | null;
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
}
interface PricingItem {
    id: string;
    vendorName: string;
    status: "CURRENT" | "EXPIRED";
    price: string;
    leadTime: number;
    quoteDate: string;
}
interface InventoryItemData {
    id: string;
    locationName: string;
    locationType: string;
    quantityOnHand: string;
    averageUnitCost: string;
    unit: string;
}

export default function CatalogueSheet({
    catalogueId,
    open,
    onOpenChange,
}: CatalogueSheetProps) {
    const { data, isLoading } = useGetCatalogueById(catalogueId);
    const scrollRef = useRef<HTMLDivElement>(null);
    useContainerLenis(scrollRef);

    const pricingItems: PricingItem[] =
        data?.data?.supplierQuotes.map((quote) => ({
            id: quote.id,
            vendorName: quote.supplier.name,
            status: quote.validUntil ? "EXPIRED" : "CURRENT",
            price: quote.truePrice,
            leadTime: quote.leadTimeDays,
            quoteDate: quote.createdAt,
        })) ?? [];

    const inventoryItems: InventoryItemData[] =
        data?.data?.inventoryItems.map((item) => ({
            id: item.id,
            locationName: item.location.name,
            locationType: item.location.type,
            quantityOnHand: item.quantityOnHand,
            averageUnitCost: item.averageUnitCost,
            unit: data.data.unit,
        })) ?? [];

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="w-full overflow-y-auto p-0 sm:max-w-[50vw]"
            >
                {isLoading && (
                    <div className="space-y-6 p-6">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                )}
                {!isLoading && data?.data && (
                    <div className="flex h-full flex-col">
                        <div className="sticky top-0 z-10 border-b border-border bg-background h-15.5">
                            <div className="flex items-center justify-between px-6 py-4">
                                <div className="flex items-center gap-4 ">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-full"
                                        onClick={() => onOpenChange(false)}
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                    </Button>
                                    <h1 className="font-display text-xl font-bold  tracking-tight text-foreground">
                                        Item Ledger
                                    </h1>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full"
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 space-y-8 px-6 py-6">
                            {/* Section 1: Item Header */}
                            <section className="flex flex-col gap-3">
                                <h2 className="truncate font-display text-4xl font-bold  leading-tight tracking-tight text-foreground">
                                    {data.data.name}
                                </h2>
                                <p className="font-sans text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                    Category:{" "}
                                    {data.data.category
                                        .toLowerCase()
                                        .replace("_", " ")}{" "}
                                    | Unit: {data.data.unit}
                                </p>
                            </section>

                            {/* Section 2: Item Details */}
                            <section className="rounded-lg border-l-4 border-green-700/20 bg-muted/30 p-5">
                                <div className="grid grid-cols-1 gap-y-3">
                                    <div className="flex flex-col">
                                        <span className="mb-0.5 font-sans text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                            Default Lead Time
                                        </span>
                                        <span className="font-sans text-sm font-medium text-foreground">
                                            {data.data.defaultLeadTime} days
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="mb-0.5 font-sans text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                            Created On
                                        </span>
                                        <span className="font-mono text-sm font-medium text-foreground">
                                            {new Date(
                                                data.data.createdAt,
                                            ).toLocaleDateString("en-IN")}
                                        </span>
                                    </div>
                                </div>
                            </section>

                            {/* Section 3: Pricing History */}
                            <section className="flex flex-col gap-4">
                                <h3 className="border-b border-border pb-2 font-display text-2xl font-bold  text-foreground">
                                    Pricing History
                                </h3>
                                {pricingItems.length > 0 ? (
                                    <>
                                        {/* Desktop/Tablet View */}
                                        <div className="hidden md:block overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="border-b border-border hover:bg-transparent">
                                                        <TableHead className="font-sans text-xs font-bold uppercase text-muted-foreground">
                                                            Vendor
                                                        </TableHead>
                                                        <TableHead className="font-sans text-xs font-bold uppercase text-muted-foreground">
                                                            Status
                                                        </TableHead>
                                                        <TableHead className="text-right font-sans text-xs font-bold uppercase text-muted-foreground">
                                                            Price / Unit
                                                        </TableHead>
                                                        <TableHead className="font-sans text-xs font-bold uppercase text-muted-foreground">
                                                            Lead Time
                                                        </TableHead>
                                                        <TableHead className="font-sans text-xs font-bold uppercase text-muted-foreground">
                                                            Quote Date
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {pricingItems.map(
                                                        (item) => (
                                                            <TableRow
                                                                key={item.id}
                                                                className={`border-b border-border/50 transition-colors ${
                                                                    item.status ===
                                                                    "CURRENT"
                                                                        ? "bg-green-50/50 hover:bg-green-50/70"
                                                                        : "hover:bg-muted/30"
                                                                }`}
                                                            >
                                                                <TableCell
                                                                    className={`py-3 font-sans text-sm font-semibold ${
                                                                        item.status ===
                                                                        "CURRENT"
                                                                            ? "text-foreground"
                                                                            : "text-muted-foreground"
                                                                    }`}
                                                                >
                                                                    {
                                                                        item.vendorName
                                                                    }
                                                                </TableCell>
                                                                <TableCell className="py-3">
                                                                    <div className="flex items-center gap-2">
                                                                        {item.status ===
                                                                        "CURRENT" ? (
                                                                            <>
                                                                                <CheckCircle2 className="h-3.5 w-3.5 text-green-700" />
                                                                                <span className="font-sans text-[10px] font-bold uppercase tracking-tighter text-green-700">
                                                                                    Current
                                                                                </span>
                                                                            </>
                                                                        ) : (
                                                                            <span className="inline-flex rounded-sm bg-muted px-2 py-0.5 font-sans text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">
                                                                                Expired
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell
                                                                    className={`py-3 text-right font-mono text-sm font-bold ${
                                                                        item.status ===
                                                                        "CURRENT"
                                                                            ? "text-green-700"
                                                                            : "text-muted-foreground/60"
                                                                    }`}
                                                                >
                                                                    ₹
                                                                    {Number.parseFloat(
                                                                        item.price,
                                                                    ).toLocaleString(
                                                                        "en-IN",
                                                                        {
                                                                            minimumFractionDigits: 2,
                                                                        },
                                                                    )}
                                                                </TableCell>
                                                                <TableCell
                                                                    className={`py-3 font-sans text-sm ${
                                                                        item.status ===
                                                                        "CURRENT"
                                                                            ? "text-foreground"
                                                                            : "text-muted-foreground/70"
                                                                    }`}
                                                                >
                                                                    {
                                                                        item.leadTime
                                                                    }{" "}
                                                                    days
                                                                </TableCell>
                                                                <TableCell
                                                                    className={`py-3 font-mono text-sm ${
                                                                        item.status ===
                                                                        "CURRENT"
                                                                            ? "text-foreground"
                                                                            : "text-muted-foreground/70"
                                                                    }`}
                                                                >
                                                                    {new Date(
                                                                        item.quoteDate,
                                                                    ).toLocaleDateString(
                                                                        "en-IN",
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        ),
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        {/* Mobile View */}
                                        <div className="flex flex-col gap-2 md:hidden">
                                            {pricingItems.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className={`rounded-lg border p-3 ${
                                                        item.status ===
                                                        "CURRENT"
                                                            ? "border-green-700/20 bg-green-50/50"
                                                            : "border-border/50 bg-muted/30"
                                                    }`}
                                                >
                                                    <div className="mb-2 flex items-start justify-between">
                                                        <span
                                                            className={`font-sans text-sm font-semibold ${
                                                                item.status ===
                                                                "CURRENT"
                                                                    ? "text-foreground"
                                                                    : "text-muted-foreground"
                                                            }`}
                                                        >
                                                            {item.vendorName}
                                                        </span>
                                                        <span
                                                            className={`font-mono font-bold ${
                                                                item.status ===
                                                                "CURRENT"
                                                                    ? "text-green-700"
                                                                    : "text-muted-foreground/60"
                                                            }`}
                                                        >
                                                            ₹
                                                            {Number.parseFloat(
                                                                item.price,
                                                            ).toLocaleString(
                                                                "en-IN",
                                                                {
                                                                    minimumFractionDigits: 2,
                                                                },
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="mb-2 flex items-center gap-2">
                                                        {item.status ===
                                                        "CURRENT" ? (
                                                            <>
                                                                <CheckCircle2 className="h-3 w-3 text-green-700" />
                                                                <span className="font-sans text-[10px] font-bold uppercase tracking-tighter text-green-700">
                                                                    Current
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span className="inline-flex rounded-sm bg-muted px-1.5 py-0.5 font-sans text-[9px] font-bold uppercase tracking-tighter text-muted-foreground">
                                                                Expired
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center justify-between text-[11px]">
                                                        <span className="font-sans text-muted-foreground">
                                                            {item.leadTime} days
                                                            lead time
                                                        </span>
                                                        <span className="font-mono text-muted-foreground">
                                                            {new Date(
                                                                item.quoteDate,
                                                            ).toLocaleDateString(
                                                                "en-IN",
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <p className="rounded-lg border border-dashed border-border p-6 text-center font-display text-sm text-muted-foreground">
                                        No pricing history available
                                    </p>
                                )}
                            </section>

                            {/* Section 4: Warehouse Breakdown */}
                            {inventoryItems.length > 0 && (
                                <section className="flex flex-col gap-4">
                                    <h3 className="border-b border-border pb-2 font-display text-2xl font-bold  text-foreground">
                                        Warehouse Breakdown
                                    </h3>

                                    {/* Desktop/Tablet View */}
                                    <div className="hidden md:block overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="border-b border-border hover:bg-transparent">
                                                    <TableHead className="font-sans text-xs font-bold uppercase text-muted-foreground">
                                                        Location
                                                    </TableHead>
                                                    <TableHead className="font-sans text-xs font-bold uppercase text-muted-foreground">
                                                        Type
                                                    </TableHead>
                                                    <TableHead className="text-right font-sans text-xs font-bold uppercase text-muted-foreground">
                                                        Quantity
                                                    </TableHead>
                                                    <TableHead className="text-right font-sans text-xs font-bold uppercase text-muted-foreground">
                                                        Avg Unit Cost
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {inventoryItems.map((item) => (
                                                    <TableRow
                                                        key={item.id}
                                                        className="border-b border-border/50 transition-colors hover:bg-muted/30"
                                                    >
                                                        <TableCell className="py-3 font-sans text-sm font-semibold text-foreground">
                                                            {item.locationName}
                                                        </TableCell>
                                                        <TableCell className="py-3">
                                                            <span className="inline-flex rounded-sm bg-muted px-2 py-0.5 font-sans text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">
                                                                {item.locationType.toLowerCase()}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="py-3 text-right font-mono text-sm text-foreground">
                                                            {Number.parseFloat(
                                                                item.quantityOnHand,
                                                            ).toLocaleString(
                                                                "en-IN",
                                                            )}{" "}
                                                            {item.unit}
                                                        </TableCell>
                                                        <TableCell className="py-3 text-right font-mono text-sm font-semibold text-foreground">
                                                            ₹
                                                            {Number.parseFloat(
                                                                item.averageUnitCost,
                                                            ).toLocaleString(
                                                                "en-IN",
                                                                {
                                                                    minimumFractionDigits: 2,
                                                                },
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Mobile View */}
                                    <div className="flex flex-col gap-2 md:hidden">
                                        {inventoryItems.map((item) => (
                                            <div
                                                key={item.id}
                                                className="rounded-lg border border-border/50 bg-muted/30 p-3"
                                            >
                                                <div className="mb-2">
                                                    <p className="font-sans text-sm font-semibold text-foreground">
                                                        {item.locationName}
                                                    </p>
                                                    <span className="mt-1 inline-flex rounded-sm bg-muted px-1.5 py-0.5 font-sans text-[9px] font-bold uppercase tracking-tighter text-muted-foreground">
                                                        {item.locationType.toLowerCase()}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-[11px]">
                                                    <span className="font-mono text-foreground">
                                                        {Number.parseFloat(
                                                            item.quantityOnHand,
                                                        ).toLocaleString(
                                                            "en-IN",
                                                        )}{" "}
                                                        {item.unit}
                                                    </span>
                                                    <span className="font-mono font-semibold text-foreground">
                                                        ₹
                                                        {Number.parseFloat(
                                                            item.averageUnitCost,
                                                        ).toLocaleString(
                                                            "en-IN",
                                                            {
                                                                minimumFractionDigits: 2,
                                                            },
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Section 5: Log Details */}
                            <section className="border-t border-border pt-4">
                                <h4 className="mb-4 font-sans text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                    Log Details
                                </h4>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage
                                            src={
                                                data.data.creator?.profileImage
                                            }
                                            alt={data.data.creator?.username}
                                        />
                                        <AvatarFallback className="bg-green-700/10 font-sans text-xs font-bold text-green-700">
                                            {data.data.creator?.username
                                                ?.split(" ")
                                                .map((n) => n[0])
                                                .join("")
                                                .toUpperCase()
                                                .slice(0, 2) || "NA"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="font-sans text-sm font-semibold text-foreground">
                                            {data.data.creator?.username ||
                                                "Unknown"}
                                        </span>
                                        <span className="font-sans text-[10px] font-medium uppercase tracking-tight text-muted-foreground">
                                            Created on{" "}
                                            {new Date(
                                                data.data.createdAt,
                                            ).toLocaleDateString("en-IN")}
                                        </span>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
