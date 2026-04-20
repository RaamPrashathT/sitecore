import type { FormEvent, ReactNode } from "react";
import { useMemo, useState } from "react";
import { AlertTriangle, ArrowRightLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
    useCatalogueInventoryLocations,
    useInventoryLocations,
    type CatalogueInventoryLocation,
} from "../../hooks/useCatalogueInventoryLocations";
import {
    useDeleteCatalogueStock,
    useTransferCatalogueStock,
} from "../../hooks/useCatalogueInventoryMovements";

const CatalogueTransactionMain = () => {
    const { data: stockData, isLoading: isStockLoading } =
        useCatalogueInventoryLocations();
    const { data: locationsData, isLoading: isLocationsLoading } =
        useInventoryLocations();

    const stockLocations = useMemo(
        () => (stockData?.data ?? []).filter((location) => location.quantityStored > 0),
        [stockData?.data],
    );
    const allLocations = locationsData?.data ?? [];
    const totalAvailable = useMemo(
        () => stockLocations.reduce((sum, location) => sum + location.quantityStored, 0),
        [stockLocations],
    );

    if (isStockLoading || isLocationsLoading) return <TransactionSkeleton />;

    if (stockLocations.length === 0) {
        return (
            <div className="max-w-3xl rounded-lg border border-dashed border-border px-6 py-12">
                <p className="text-sm font-semibold text-foreground">
                    No stock available
                </p>
                <p className="mt-1 max-w-prose text-sm text-muted-foreground">
                    Transfers and reductions become available after this catalogue item has stock in a location.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl space-y-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-prose space-y-1">
                    <h3 className="text-base font-semibold tracking-tight text-foreground">
                        Inventory movement
                    </h3>
                    <p className="text-sm leading-6 text-muted-foreground">
                        Transfer stock between active locations or reduce a recorded quantity with an auditable issue entry.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border">
                    <MetricCell label="Sources" value={String(stockLocations.length)} />
                    <MetricCell
                        label="Available"
                        value={totalAvailable.toLocaleString("en-IN")}
                    />
                </div>
            </div>

            <Tabs defaultValue="transfer" className="w-full">
                <TabsList className="w-fit">
                    <TabsTrigger value="transfer" className="gap-1.5">
                        <ArrowRightLeft className="size-3.5" />
                        Transfer
                    </TabsTrigger>
                    <TabsTrigger value="delete" className="gap-1.5">
                        <Trash2 className="size-3.5" />
                        Delete
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="transfer" className="pt-4">
                    <TransferStockForm
                        stockLocations={stockLocations}
                        allLocations={allLocations}
                    />
                </TabsContent>
                <TabsContent value="delete" className="pt-4">
                    <DeleteStockForm stockLocations={stockLocations} />
                </TabsContent>
            </Tabs>
        </div>
    );
};

function TransferStockForm({
    stockLocations,
    allLocations,
}: {
    stockLocations: CatalogueInventoryLocation[];
    allLocations: Array<{
        id: string;
        name: string;
        code: string | null;
        type: "WAREHOUSE" | "PROJECT";
    }>;
}) {
    const transfer = useTransferCatalogueStock();
    const [fromLocationId, setFromLocationId] = useState("");
    const [toLocationId, setToLocationId] = useState("");
    const [quantity, setQuantity] = useState("");

    const source = stockLocations.find((location) => location.id === fromLocationId);
    const availableQuantity = source?.quantityStored ?? 0;
    const parsedQuantity = Number(quantity);
    const destinationLocations = allLocations.filter(
        (location) => location.id !== fromLocationId,
    );
    const canSubmit =
        !!fromLocationId &&
        !!toLocationId &&
        parsedQuantity > 0 &&
        parsedQuantity <= availableQuantity &&
        !transfer.isPending;

    function submitTransfer(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!canSubmit) return;

        transfer.mutate(
            {
                fromLocationId,
                toLocationId,
                quantity: parsedQuantity,
                remarks: "Transferred from catalogue transaction tab",
            },
            {
                onSuccess: () => {
                    setFromLocationId("");
                    setToLocationId("");
                    setQuantity("");
                },
            },
        );
    }

    return (
        <TransactionPanel
            eyebrow="Internal movement"
            title="Move stock to another location"
            description="The source quantity is reduced and the destination quantity is increased in one transaction."
        >
            <form onSubmit={submitTransfer} className="space-y-5">
                <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-start">
                    <FieldBlock label="From location">
                        <LocationSelect
                            value={fromLocationId}
                            placeholder="Select source"
                            locations={stockLocations}
                            onValueChange={(value) => {
                                setFromLocationId(value);
                                setToLocationId("");
                                setQuantity("");
                            }}
                            showQuantity
                        />
                    </FieldBlock>

                    <div className="hidden h-9 items-center justify-center pt-7 text-muted-foreground md:flex">
                        <ArrowRightLeft className="size-4" />
                    </div>

                    <FieldBlock label="To location">
                        <LocationSelect
                            value={toLocationId}
                            placeholder="Select destination"
                            locations={destinationLocations}
                            onValueChange={setToLocationId}
                            disabled={!fromLocationId}
                        />
                    </FieldBlock>
                </div>

                <FieldBlock
                    label="Quantity to transfer"
                    hint={
                        source
                            ? `Available at source: ${availableQuantity.toLocaleString("en-IN")}`
                            : "Choose a source location first."
                    }
                >
                    <QuantityInput
                        value={quantity}
                        onChange={setQuantity}
                        max={availableQuantity}
                        disabled={!source}
                    />
                    {parsedQuantity > availableQuantity && (
                        <p className="text-xs text-destructive">
                            Quantity cannot exceed available stock.
                        </p>
                    )}
                </FieldBlock>

                <div className="flex justify-end">
                    <Button type="submit" disabled={!canSubmit}>
                        {transfer.isPending ? "Transferring..." : "Transfer stock"}
                    </Button>
                </div>
            </form>
        </TransactionPanel>
    );
}

function DeleteStockForm({
    stockLocations,
}: {
    stockLocations: CatalogueInventoryLocation[];
}) {
    const deleteStock = useDeleteCatalogueStock();
    const [fromLocationId, setFromLocationId] = useState("");
    const [quantity, setQuantity] = useState("");

    const source = stockLocations.find((location) => location.id === fromLocationId);
    const availableQuantity = source?.quantityStored ?? 0;
    const parsedQuantity = Number(quantity);
    const canSubmit =
        !!source &&
        parsedQuantity > 0 &&
        parsedQuantity <= availableQuantity &&
        !deleteStock.isPending;

    function submitDelete(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!source || !canSubmit) return;

        deleteStock.mutate(
            {
                fromLocationId: source.id,
                quantity: parsedQuantity,
                remarks: "Reduced from catalogue transaction tab",
            },
            {
                onSuccess: () => {
                    setFromLocationId("");
                    setQuantity("");
                },
            },
        );
    }

    return (
        <TransactionPanel
            eyebrow="Stock reduction"
            title="Remove part of a stored quantity"
            description="Use this when stock is damaged, lost, consumed, or corrected after a count."
            tone="danger"
        >
            <form onSubmit={submitDelete} className="space-y-5">
                <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-3 text-amber-900">
                    <div className="flex gap-2">
                        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                        <div className="space-y-1">
                            <p className="text-sm font-semibold">Permanent inventory record</p>
                            <p className="text-xs leading-5">
                                This subtracts only the quantity you enter. It does not delete the location or catalogue item, but the movement history cannot be undone casually.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <FieldBlock label="From location">
                        <LocationSelect
                            value={fromLocationId}
                            placeholder="Select source"
                            locations={stockLocations}
                            onValueChange={(value) => {
                                setFromLocationId(value);
                                setQuantity("");
                            }}
                            showQuantity
                        />
                    </FieldBlock>

                    <FieldBlock
                        label="Quantity to remove"
                        hint={
                            source
                                ? `Available: ${availableQuantity.toLocaleString("en-IN")}`
                                : "Choose a source location first."
                        }
                    >
                        <QuantityInput
                            value={quantity}
                            onChange={setQuantity}
                            max={availableQuantity}
                            disabled={!source}
                        />
                        {parsedQuantity > availableQuantity && (
                            <p className="text-xs text-destructive">
                                You can only remove what is currently stored.
                            </p>
                        )}
                    </FieldBlock>
                </div>

                <div className="flex justify-end">
                    <Button type="submit" variant="destructive" disabled={!canSubmit}>
                        {deleteStock.isPending ? "Removing..." : "Remove quantity"}
                    </Button>
                </div>
            </form>
        </TransactionPanel>
    );
}

function TransactionPanel({
    eyebrow,
    title,
    description,
    tone = "default",
    children,
}: {
    eyebrow: string;
    title: string;
    description: string;
    tone?: "default" | "danger";
    children: ReactNode;
}) {
    return (
        <section className="overflow-hidden rounded-lg border border-border bg-background">
            <div className="grid gap-4 border-b border-border bg-muted/30 px-4 py-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
                <div className="space-y-1">
                    <p
                        className={cn(
                            "text-[11px] font-semibold uppercase tracking-wide",
                            tone === "danger" ? "text-destructive" : "text-primary",
                        )}
                    >
                        {eyebrow}
                    </p>
                    <h4 className="text-sm font-semibold text-foreground">{title}</h4>
                    <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                        {description}
                    </p>
                </div>
            </div>
            <div className="px-4 py-5">{children}</div>
        </section>
    );
}

function LocationSelect({
    value,
    placeholder,
    locations,
    onValueChange,
    disabled = false,
    showQuantity = false,
}: {
    value: string;
    placeholder: string;
    locations: Array<{
        id: string;
        name: string;
        code: string | null;
        type: "WAREHOUSE" | "PROJECT";
        quantityStored?: number;
    }>;
    onValueChange: (value: string) => void;
    disabled?: boolean;
    showQuantity?: boolean;
}) {
    return (
        <Select value={value} onValueChange={onValueChange} disabled={disabled}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                        <span className="flex w-full items-center justify-between gap-3">
                            <span className="truncate">
                                {location.name}
                                {location.code ? ` (${location.code})` : ""}
                            </span>
                            <span
                                className={cn(
                                    "text-[10px] font-semibold uppercase tracking-wide",
                                    location.type === "WAREHOUSE"
                                        ? "text-emerald-700"
                                        : "text-sky-700",
                                )}
                            >
                                {showQuantity && location.quantityStored !== undefined
                                    ? location.quantityStored.toLocaleString("en-IN")
                                    : location.type}
                            </span>
                        </span>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

function QuantityInput({
    value,
    onChange,
    max,
    disabled,
}: {
    value: string;
    onChange: (value: string) => void;
    max: number;
    disabled?: boolean;
}) {
    return (
        <Input
            type="number"
            min="0.001"
            step="0.001"
            max={max || undefined}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            disabled={disabled}
            placeholder="0.000"
            className="max-w-xs font-mono tabular-nums"
        />
    );
}

function FieldBlock({
    label,
    hint,
    children,
}: {
    label: string;
    hint?: string;
    children: ReactNode;
}) {
    return (
        <div className="space-y-2">
            <Label className="text-xs font-semibold text-foreground">{label}</Label>
            {children}
            {hint && <p className="text-xs leading-5 text-muted-foreground">{hint}</p>}
        </div>
    );
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

function TransactionSkeleton() {
    return (
        <div className="max-w-4xl space-y-5">
            <div className="flex items-end justify-between gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <Skeleton className="h-16 w-56" />
            </div>
            <Skeleton className="h-9 w-48" />
            <div className="rounded-lg border border-border">
                <div className="border-b border-border bg-muted/30 px-4 py-4">
                    <Skeleton className="h-16 w-full" />
                </div>
                <div className="grid gap-4 px-4 py-5 md:grid-cols-2">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </div>
            </div>
        </div>
    );
}

export default CatalogueTransactionMain;
