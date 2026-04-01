import type { DashboardItemType } from "../hooks/useGetDashboardItems";
import type { Row } from "@tanstack/react-table";
import { useState } from "react";

type DashboardItemCardProps = {
    row: Row<DashboardItemType>;
};

const statusConfig: Record<string, { pill: string }> = {
    URGENT: { pill: "bg-red-50 text-red-700 border border-red-200" },
    DUE:    { pill: "bg-amber-50 text-amber-700 border border-amber-200" },
    UPCOMING: { pill: "bg-green-50 text-green-700 border border-green-200" },
};

const AdminDashboardCard = ({ row }: DashboardItemCardProps) => {
    const item = row.original;
    const config = statusConfig[item.status] ?? statusConfig.UPCOMING;

    const [warehouseQty, setWarehouseQty] = useState<string>(
        item.inventory ?? ""
    );

    const dropDeadDate = new Date(item.phaseStartDate);
    dropDeadDate.setDate(dropDeadDate.getDate() - item.leadTime);

    const parsedWarehouse = parseInt(warehouseQty) || 0;
    const toOrderQty = Math.max(0, item.quantity - parsedWarehouse);

    return (
        <div className="bg-white border border-stone-200 rounded-xl p-5 flex flex-col gap-4 hover:border-stone-300 transition-colors">

            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <p
                        className="text-base font-semibold text-stone-900 truncate"
                        style={{ fontFamily: "'Fraunces', serif" }}
                    >
                        {item.itemName}
                    </p>
                    <p
                        className="text-xs text-stone-400 mt-0.5 truncate"
                        style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
                    >
                        {item.projectName}
                        {item.supplierName ? ` · ${item.supplierName}` : ""}
                    </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                    <span
                        className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full capitalize ${config.pill}`}
                        style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
                    >
                        {item.status.toLowerCase()}
                    </span>
                    <input
                        type="checkbox"
                        checked={row.getIsSelected()}
                        onChange={() => row.toggleSelected()}
                        className="w-4 h-4 rounded border-stone-300 accent-green-700 cursor-pointer"
                    />
                </div>
            </div>

            {/* Stats row */}
            <div
                className="grid grid-cols-3 gap-3"
                style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
            >
                <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] uppercase tracking-widest text-stone-400 font-medium">
                        Needed
                    </span>
                    <span
                        className="text-sm text-stone-800 font-medium tabular-nums"
                        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    >
                        {item.quantity} {item.unit}
                    </span>
                </div>

                <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] uppercase tracking-widest text-stone-400 font-medium">
                        Order by
                    </span>
                    <span
                        className="text-sm text-stone-800 font-medium tabular-nums"
                        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    >
                        {dropDeadDate.toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                        })}
                    </span>
                </div>

                <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] uppercase tracking-widest text-stone-400 font-medium">
                        Days left
                    </span>
                    <span
                        className={`text-sm font-medium tabular-nums ${
                            item.daysTillOrder <= 3
                                ? "text-red-600"
                                : item.daysTillOrder <= 7
                                ? "text-amber-600"
                                : "text-stone-800"
                        }`}
                        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    >
                        {item.daysTillOrder}d
                    </span>
                </div>
            </div>

            <div className="border-t border-stone-100" />

            {/* Warehouse input */}
            <div
                className="flex items-center gap-2"
                style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
            >
                <span className="text-xs text-stone-400 whitespace-nowrap">
                    From warehouse
                </span>
                <input
                    type="number"
                    min={0}
                    max={item.quantity}
                    value={warehouseQty}
                    onChange={(e) => setWarehouseQty(e.target.value)}
                    placeholder="0"
                    className="w-24 text-xs border border-stone-200 rounded-lg px-2.5 py-1.5 text-stone-800 tabular-nums focus:outline-none focus:ring-1 focus:ring-green-700 focus:border-green-700 transition"
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                />
                <span className="text-xs text-stone-400">{item.unit}</span>

                {toOrderQty > 0 && (
                    <span
                        className="ml-auto text-xs text-stone-400 whitespace-nowrap"
                        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    >
                        to order:{" "}
                        <span className="text-stone-700 font-medium">
                            {toOrderQty} {item.unit}
                        </span>
                    </span>
                )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => {}}
                    className="flex-1 text-xs font-medium py-2 px-3 rounded-lg bg-green-700 text-white hover:bg-green-800 active:scale-[0.98] transition-all"
                    style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
                >
                    {toOrderQty > 0
                        ? `Order ${toOrderQty} ${item.unit}`
                        : "Use warehouse stock"}
                </button>

                {parsedWarehouse > 0 && toOrderQty > 0 && (
                    <button
                        type="button"
                        onClick={() => {}}
                        className="text-xs font-medium py-2 px-3 rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-50 active:scale-[0.98] transition-all whitespace-nowrap"
                        style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
                    >
                        Order full {item.quantity}
                    </button>
                )}
            </div>

        </div>
    );
};

export default AdminDashboardCard;