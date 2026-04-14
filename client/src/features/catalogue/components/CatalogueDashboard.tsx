import { memo, useMemo, useState } from "react";
import {
    getCoreRowModel,
    useReactTable,
    flexRender,
    createColumnHelper,
} from "@tanstack/react-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useGetCatalogueById } from "../hooks/useCatalogue";
import {
    useGetInventoryBalances,
    useGetInventoryTransactions,
} from "../hooks/useInventory";
import type { InventoryItemType, InventoryTransactionType } from "../hooks/useInventory";
import QuoteManager from "./QuoteManager";
import SupplierManager from "./SupplierManager";
import LocationManager from "./LocationManager";
import {
    ReceiveMaterialDialog,
    ConsumeMaterialDialog,
    AdjustStockDialog,
} from "./InventoryOperationDialogs";
import { format } from "date-fns";

// ─── Column definitions (stable module-level, never recreated) ────────────────

const TX_BADGE: Record<string, string> = {
    RECEIVED: "bg-green-100 text-green-800 border-green-200",
    CONSUMED: "bg-orange-100 text-orange-800 border-orange-200",
    ADJUSTED: "bg-blue-100 text-blue-800 border-blue-200",
};

const balanceHelper = createColumnHelper<InventoryItemType>();
const balanceColumns = [
    balanceHelper.accessor((row) => row.location.name, {
        id: "location",
        header: "Location",
        cell: (info) => (
            <div className="px-4 py-3 font-sans text-sm text-foreground">
                {info.getValue()}
            </div>
        ),
    }),
    balanceHelper.accessor((row) => row.location.type, {
        id: "locationType",
        header: "Type",
        cell: (info) => (
            <div className="px-4 py-3 font-sans text-sm text-muted-foreground capitalize">
                {info.getValue()}
            </div>
        ),
    }),
    balanceHelper.accessor("quantityOnHand", {
        header: "Qty on Hand",
        cell: (info) => (
            <div className="px-4 py-3 font-mono text-sm tabular-nums text-foreground font-medium">
                {Number(info.getValue()).toLocaleString()}
            </div>
        ),
    }),
    balanceHelper.accessor("averageUnitCost", {
        header: "Avg Unit Cost",
        cell: (info) => {
            const val = Number(info.getValue());
            return (
                <div className="px-4 py-3 font-mono text-sm tabular-nums text-muted-foreground">
                    {val > 0 ? val.toLocaleString() : "—"}
                </div>
            );
        },
    }),
];

const txHelper = createColumnHelper<InventoryTransactionType>();
const txColumns = [
    txHelper.accessor("createdAt", {
        header: "Date",
        cell: (info) => (
            <div className="px-4 py-3 font-sans text-sm text-muted-foreground whitespace-nowrap">
                {format(new Date(info.getValue()), "dd MMM yyyy, HH:mm")}
            </div>
        ),
    }),
    txHelper.accessor("type", {
        header: "Type",
        cell: (info) => (
            <div className="px-4 py-3">
                <Badge
                    variant="outline"
                    className={`font-sans text-xs font-medium ${TX_BADGE[info.getValue()] ?? ""}`}
                >
                    {info.getValue()}
                </Badge>
            </div>
        ),
    }),
    txHelper.accessor((row) => row.inventoryItem.location.name, {
        id: "txLocation",
        header: "Location",
        cell: (info) => (
            <div className="px-4 py-3 font-sans text-sm text-foreground">
                {info.getValue()}
            </div>
        ),
    }),
    txHelper.accessor("quantityChange", {
        header: "Qty Change",
        cell: (info) => {
            const val = Number(info.getValue());
            const isPositive = val > 0;
            return (
                <div
                    className={`px-4 py-3 font-mono text-sm tabular-nums font-medium ${
                        isPositive ? "text-green-700" : "text-red-600"
                    }`}
                >
                    {isPositive ? `+${val.toLocaleString()}` : val.toLocaleString()}
                </div>
            );
        },
    }),
    txHelper.accessor("notes", {
        header: "Notes",
        cell: (info) => (
            <div className="px-4 py-3 font-sans text-sm text-muted-foreground">
                {info.getValue() ?? "—"}
            </div>
        ),
    }),
];

// ─── Tab panels as isolated memoized components ───────────────────────────────
// Each panel owns its own data fetching and table instance.
// memo() ensures they only re-render when their own props change,
// not when the parent re-renders due to tab switching.

const SuppliersTab = memo(({ catalogueId, unit }: { catalogueId: string; unit: string }) => (
    <QuoteManager catalogueId={catalogueId} unit={unit} />
));
SuppliersTab.displayName = "SuppliersTab";

const OrgSuppliersTab = memo(() => <SupplierManager />);
OrgSuppliersTab.displayName = "OrgSuppliersTab";
const InventoryTab = ({ catalogueId }: { catalogueId: string }) => {
    const { data: balancesRaw = [], isLoading } = useGetInventoryBalances();

    const balances = useMemo(
        () => balancesRaw.filter((b) => b.catalogueId === catalogueId),
        [balancesRaw, catalogueId],
    );

    const table = useReactTable({
        data: balances,
        columns: balanceColumns,
        getCoreRowModel: getCoreRowModel(),
        getRowId: (row) => row.id,
    });

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
                <ReceiveMaterialDialog catalogueId={catalogueId} />
                <ConsumeMaterialDialog catalogueId={catalogueId} />
                <AdjustStockDialog catalogueId={catalogueId} />
            </div>

            <LocationManager />

            <div className="rounded-xl border border-border/70 bg-background overflow-x-auto">
                <Table className="font-sans">
                    <TableHeader>
                        {table.getHeaderGroups().map((hg) => (
                            <TableRow key={hg.id} className="border-b border-border/80 bg-muted/40">
                                {hg.headers.map((h) => (
                                    <TableHead
                                        key={h.id}
                                        className="h-11 px-4 font-display text-sm font-normal tracking-wide text-foreground"
                                    >
                                        {flexRender(h.column.columnDef.header, h.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {(() => {
                            if (isLoading) {
                                return (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center font-sans text-sm text-muted-foreground">
                                            Loading...
                                        </TableCell>
                                    </TableRow>
                                );
                            }
                            if (table.getRowModel().rows.length === 0) {
                                return (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center font-sans text-sm text-muted-foreground italic">
                                            No stock recorded yet. Use "Receive" to add inventory.
                                        </TableCell>
                                    </TableRow>
                                );
                            }
                            return table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} className="border-b border-border/60 hover:bg-green-50/50">
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="p-0">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ));
                        })()}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};
InventoryTab.displayName = "InventoryTab";

const LedgerTab = ({ catalogueId }: { catalogueId: string }) => {
    const { data: txData, isLoading } = useGetInventoryTransactions({
        catalogueId,
        pageSize: 50,
    });

    const transactions = useMemo(() => txData?.data ?? [], [txData]);

    const table = useReactTable({
        data: transactions,
        columns: txColumns,
        getCoreRowModel: getCoreRowModel(),
        getRowId: (row) => row.id,
    });

    return (
        <div className="rounded-xl border border-border/70 bg-background overflow-x-auto">
            <Table className="font-sans">
                <TableHeader>
                    {table.getHeaderGroups().map((hg) => (
                        <TableRow key={hg.id} className="border-b border-border/80 bg-muted/40">
                            {hg.headers.map((h) => (
                                <TableHead
                                    key={h.id}
                                    className="h-11 px-4 font-display text-sm font-normal tracking-wide text-foreground"
                                >
                                    {flexRender(h.column.columnDef.header, h.getContext())}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {(() => {
                        if (isLoading) {
                            return (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center font-sans text-sm text-muted-foreground">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            );
                        }
                        if (table.getRowModel().rows.length === 0) {
                            return (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center font-sans text-sm text-muted-foreground italic">
                                        No transactions recorded yet.
                                    </TableCell>
                                </TableRow>
                            );
                        }
                        return table.getRowModel().rows.map((row) => (
                            <TableRow key={row.id} className="border-b border-border/60 hover:bg-muted/30">
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id} className="p-0">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ));
                    })()}
                </TableBody>
            </Table>
        </div>
    );
};
LedgerTab.displayName = "LedgerTab";

// ─── Main Dashboard ───────────────────────────────────────────────────────────

interface CatalogueDashboardProps {
    catalogueId: string;
}

const CatalogueDashboard = ({ catalogueId }: CatalogueDashboardProps) => {
    const [activeTab, setActiveTab] = useState("suppliers");
    const { data: catalogue, isLoading: catalogueLoading } = useGetCatalogueById(catalogueId);

    if (catalogueLoading) {
        return (
            <div className="px-6 py-8 font-sans text-sm text-muted-foreground">
                Loading...
            </div>
        );
    }

    if (!catalogue) {
        return (
            <div className="px-6 py-8 font-sans text-sm text-muted-foreground">
                Catalogue item not found.
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 px-4 py-4 font-sans">
            {/* ── Header ── */}
            <div className="border-b border-border/70 pb-4">
                <p className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-1">
                    Catalogue Item
                </p>
                <h1 className="font-display text-2xl font-normal tracking-wide text-foreground">
                    {catalogue.name}
                </h1>
                <div className="mt-1 flex items-center gap-3">
                    <Badge
                        variant="outline"
                        className="font-sans text-xs font-normal text-muted-foreground capitalize"
                    >
                        {catalogue.category.toLowerCase()}
                    </Badge>
                    <span className="font-mono text-xs text-muted-foreground">
                        {catalogue.unit}
                    </span>
                </div>
            </div>

            {/* ── Tabs ── */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList variant="line" className="mb-4">
                    <TabsTrigger value="suppliers">Suppliers & Quotes</TabsTrigger>
                    <TabsTrigger value="org-suppliers">Suppliers</TabsTrigger>
                    <TabsTrigger value="inventory">Inventory Balances</TabsTrigger>
                    <TabsTrigger value="ledger">Ledger History</TabsTrigger>
                </TabsList>

                {/* forceMount keeps all panels in the DOM — no remount on tab switch */}
                <TabsContent forceMount value="suppliers" hidden={activeTab !== "suppliers"}>
                    <SuppliersTab catalogueId={catalogueId} unit={catalogue.unit} />
                </TabsContent>

                <TabsContent forceMount value="inventory" hidden={activeTab !== "inventory"}>
                    <InventoryTab catalogueId={catalogueId} />
                </TabsContent>

                <TabsContent forceMount value="ledger" hidden={activeTab !== "ledger"}>
                    <LedgerTab catalogueId={catalogueId} />
                </TabsContent>

                <TabsContent forceMount value="org-suppliers" hidden={activeTab !== "org-suppliers"}>
                    <OrgSuppliersTab />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default CatalogueDashboard;
