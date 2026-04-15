import { useState } from "react";
import type { DashboardItemType } from "../hooks/useGetDashboardItems";
import type { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMembership } from "@/hooks/useMembership";
import { useOrderDashboardItem } from "../hooks/useOrderDashboardItem";
import {
    Loader2,
    Package,
    Clock,
    Warehouse,
    Building2,
    Layers,
    Truck,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    ShoppingCart,
    SplitSquareHorizontal,
} from "lucide-react";

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount);

type DashboardItemCardProps = {
    row: Row<DashboardItemType>;
};

const AdminDashboardCard = ({ row }: DashboardItemCardProps) => {
    const item = row.original;
    const { data: membership } = useMembership();
    const { mutate, isPending } = useOrderDashboardItem(membership?.id);

    const rawInventory = Number(item.inventory) || 0;
    const usableInventory = Math.max(0, rawInventory);
    const requestedQty = Number(item.quantity) || 0;

    const [warehouseQty, setWarehouseQty] = useState<string>("0");

    const rawInput = Number(warehouseQty) || 0;
    const isExceedingStock = rawInput > usableInventory;
    const isExceedingRequested = rawInput > requestedQty;
    const hasError = isExceedingStock || isExceedingRequested;

    let errorMessage = "";
    if (isExceedingStock) errorMessage = "Exceeds available stock";
    else if (isExceedingRequested) errorMessage = "Exceeds requested qty";

    const parsedWarehouse = Math.max(0, Math.min(rawInput, usableInventory, requestedQty));
    const toOrderQty = Math.max(0, requestedQty - parsedWarehouse);

    const hasSufficientStock = usableInventory >= requestedQty && requestedQty > 0;
    const hasPartialStock = usableInventory > 0 && usableInventory < requestedQty;
    const hasNoStock = usableInventory <= 0;

    const handleOrderExternally = () => mutate({ requisitionItemId: item.id, deductInventoryQty: 0 });
    const handleUseFullStock = () => mutate({ requisitionItemId: item.id, deductInventoryQty: requestedQty });
    const handleSplitOrder = () => mutate({ requisitionItemId: item.id, deductInventoryQty: parsedWarehouse });

    const isUrgent = item.daysTillOrder <= 3;
    const isDueSoon = item.daysTillOrder <= 7 && item.daysTillOrder > 3;

    // ── Card shell styling ──────────────────────────────────────────────────
    const cardShell = isUrgent
        ? "bg-white ring-1 ring-red-200 shadow-sm shadow-red-100/60"
        : isDueSoon
        ? "bg-white ring-1 ring-amber-200 shadow-sm shadow-amber-100/60"
        : "bg-white ring-1 ring-slate-200/80 shadow-sm shadow-slate-100/40";

    // ── Status badge ────────────────────────────────────────────────────────
    const StatusBadge = () => {
        if (isUrgent) {
            return (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-red-50 text-red-600 ring-1 ring-red-200 font-mono">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    Urgent
                </span>
            );
        }
        if (isDueSoon) {
            return (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 ring-1 ring-amber-200 font-mono">
                    <Clock className="w-2.5 h-2.5" />
                    Due Soon
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 ring-1 ring-slate-200 font-mono">
                <CheckCircle2 className="w-2.5 h-2.5" />
                Upcoming
            </span>
        );
    };

    // ── Stock status badge ──────────────────────────────────────────────────
    const StockBadge = () => {
        if (hasSufficientStock) {
            return (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700 ring-1 ring-green-200 font-mono">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Stock Available
                </span>
            );
        }
        if (hasPartialStock) {
            return (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 ring-1 ring-amber-200 font-mono">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    Partial Stock
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600 ring-1 ring-red-200 font-mono">
                <XCircle className="w-2.5 h-2.5" />
                No Stock
            </span>
        );
    };

    // ── Stat tile colours ───────────────────────────────────────────────────
    const stockNumColor = hasSufficientStock
        ? "text-green-700"
        : hasNoStock
        ? "text-red-600"
        : "text-amber-600";

    const daysNumColor = isUrgent ? "text-red-600" : isDueSoon ? "text-amber-600" : "text-slate-800";

    return (
        <div
            className={`rounded-2xl ${cardShell} hover:shadow-md ${
                isPending ? "opacity-50 pointer-events-none" : ""
            }`}
        >
            <div className="p-5">

                {/* ── ROW 1: Title + badges ─────────────────────────────── */}
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-[17px] text-slate-900 tracking-tight leading-tight mb-1.5">
                            {item.itemName}
                        </h3>
                        <div className="flex flex-wrap items-center gap-1.5">
                            <StatusBadge />
                            <StockBadge />
                        </div>
                    </div>

                    {/* Budget — desktop */}
                    <div className="hidden lg:flex flex-col items-end gap-1 shrink-0 text-right">
                        <span className="text-[11px] text-slate-400 font-mono">
                            Project <span className="text-slate-600 font-semibold">{formatCurrency(item.projectBudget)}</span>
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                            Phase <span className="text-slate-600 font-semibold">{formatCurrency(item.phaseBudget)}</span>
                        </span>
                    </div>
                </div>

                {/* ── ROW 2: Metadata ───────────────────────────────────── */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-4 pb-4 border-b border-slate-100">
                    <span className="inline-flex items-center gap-1.5 text-[12px] text-slate-500">
                        <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-700">{item.projectName}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[12px] text-slate-500">
                        <Layers className="w-3 h-3 text-slate-400 shrink-0" />
                        {item.phaseName}
                    </span>
                    {item.supplierName && (
                        <span className="inline-flex items-center gap-1.5 text-[12px] text-slate-500">
                            <Truck className="w-3 h-3 text-slate-400 shrink-0" />
                            {item.supplierName}
                        </span>
                    )}
                </div>

                {/* ── ROW 3: Stats ──────────────────────────────────────── */}
                <div className="grid grid-cols-3 gap-2.5 mb-4">
                    {/* Requested */}
                    <div className="flex flex-col gap-1 bg-slate-50 rounded-xl px-3.5 py-3">
                        <div className="flex items-center gap-1.5">
                            <Package className="w-3 h-3 text-slate-400" />
                            <span className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold">Requested</span>
                        </div>
                        <p className="font-mono font-bold text-xl text-slate-800 leading-none tabular-nums">
                            {requestedQty.toLocaleString("en-IN")}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">{item.unit}</p>
                    </div>

                    {/* In Stock */}
                    <div className={`flex flex-col gap-1 rounded-xl px-3.5 py-3 ${
                        hasSufficientStock ? "bg-green-50" : hasNoStock ? "bg-red-50" : "bg-amber-50"
                    }`}>
                        <div className="flex items-center gap-1.5">
                            <Warehouse className={`w-3 h-3 ${stockNumColor}`} />
                            <span className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold">In Stock</span>
                        </div>
                        <p className={`font-mono font-bold text-xl leading-none tabular-nums ${stockNumColor}`}>
                            {rawInventory.toLocaleString("en-IN")}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">{item.unit}</p>
                    </div>

                    {/* Order In */}
                    <div className={`flex flex-col gap-1 rounded-xl px-3.5 py-3 ${
                        isUrgent ? "bg-red-50" : isDueSoon ? "bg-amber-50" : "bg-slate-50"
                    }`}>
                        <div className="flex items-center gap-1.5">
                            <Clock className={`w-3 h-3 ${daysNumColor}`} />
                            <span className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold">Order In</span>
                        </div>
                        <p className={`font-mono font-bold text-xl leading-none tabular-nums ${daysNumColor}`}>
                            {item.daysTillOrder}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">days</p>
                    </div>
                </div>

                {/* ── ROW 4: Actions ────────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">

                    {/* Primary: Use Full Stock — most prominent when available */}
                    <Button
                        size="sm"
                        disabled={!hasSufficientStock || isPending}
                        onClick={handleUseFullStock}
                        className={`h-9 text-xs font-semibold px-4 flex-1 sm:flex-none transition-all duration-150 ${
                            hasSufficientStock
                                ? "bg-green-700 hover:bg-green-800 text-white shadow-sm shadow-green-200"
                                : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        }`}
                    >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                        Use Full Stock
                    </Button>

                    {/* Secondary: Order Externally */}
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 text-xs font-medium px-4 flex-1 sm:flex-none border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all duration-150"
                        onClick={handleOrderExternally}
                        disabled={isPending}
                    >
                        <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
                        Order Externally
                    </Button>

                    {/* Tertiary: Split — only when partial/sufficient stock */}
                    {(hasPartialStock || hasSufficientStock) && (
                        <div className="flex items-center gap-2 sm:ml-auto">
                            <div className="flex items-center gap-1.5 bg-slate-50 rounded-lg px-2.5 py-1.5 ring-1 ring-slate-200">
                                <SplitSquareHorizontal className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="text-[10px] text-slate-500 font-medium shrink-0">From stock:</span>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        min={0}
                                        value={warehouseQty}
                                        onChange={(e) => setWarehouseQty(e.target.value)}
                                        className={`w-14 h-7 text-xs font-mono px-2 bg-white border-slate-200 focus-visible:ring-green-500/30 ${
                                            hasError ? "border-red-300 focus-visible:ring-red-300/30" : ""
                                        }`}
                                        placeholder="0"
                                        disabled={isPending}
                                    />
                                    {hasError && (
                                        <span className="absolute -bottom-4 left-0 text-[9px] text-red-500 whitespace-nowrap font-medium">
                                            {errorMessage}
                                        </span>
                                    )}
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono shrink-0">{item.unit}</span>
                            </div>

                            <Button
                                size="sm"
                                onClick={handleSplitOrder}
                                disabled={isPending || rawInput === 0 || hasError}
                                className="h-9 text-xs font-semibold px-3 shrink-0 bg-slate-800 hover:bg-slate-900 text-white transition-all duration-150 whitespace-nowrap"
                            >
                                {isPending ? (
                                    <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
                                ) : (
                                    <SplitSquareHorizontal className="w-3 h-3 mr-1.5" />
                                )}
                                Split {!hasError && toOrderQty > 0 && (
                                    <span className="ml-1 opacity-70">({toOrderQty} to order)</span>
                                )}
                            </Button>
                        </div>
                    )}
                </div>

                {/* Budget — mobile */}
                <div className="flex lg:hidden items-center gap-3 mt-3.5 pt-3.5 border-t border-slate-100">
                    <span className="text-[11px] text-slate-400 font-mono">
                        Project <span className="text-slate-600 font-semibold">{formatCurrency(item.projectBudget)}</span>
                    </span>
                    <span className="text-slate-200">·</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                        Phase <span className="text-slate-600 font-semibold">{formatCurrency(item.phaseBudget)}</span>
                    </span>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboardCard;
