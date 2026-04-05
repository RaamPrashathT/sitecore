import { useState } from "react";
import type { DashboardItemType } from "../hooks/useGetDashboardItems";
import type { Row } from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type DashboardItemCardProps = {
    row: Row<DashboardItemType>;
};

const AdminDashboardCard = ({ row }: DashboardItemCardProps) => {
    const item = row.original;
    const isSelected = row.getIsSelected();

    const inventoryQty = Number(item.inventory) || 0;
    const requestedQty = Number(item.quantity) || 0;

    const [warehouseQty, setWarehouseQty] = useState<string>(item.inventory ?? "");

    const parsedWarehouse = Math.max(0, Math.min(Number(warehouseQty) || 0, inventoryQty, requestedQty));
    const toOrderQty = Math.max(0, requestedQty - parsedWarehouse);

    const hasSufficientStock = inventoryQty >= requestedQty;
    const hasPartialStock = inventoryQty > 0 && inventoryQty < requestedQty;
    const hasNoStock = inventoryQty === 0;

    const isUrgent = item.daysTillOrder <= 3;
    const isDueSoon = item.daysTillOrder <= 7 && item.daysTillOrder > 3;

    const stockColor = hasSufficientStock
        ? "text-green-700"
        : hasNoStock
        ? "text-destructive"
        : "text-amber-600";

    const daysColor = isUrgent
        ? "text-destructive"
        : isDueSoon
        ? "text-amber-600"
        : "text-foreground";

    const statusVariant = item.status === "URGENT"
        ? "destructive"
        : item.status === "DUE"
        ? "default"
        : "secondary";

    return (
        <Card
            className={`
                relative overflow-hidden px-5 py-4 transition-all duration-150
                ${isSelected
                    ? "ring-2 ring-green-700 border-green-700/40 bg-green-700/[0.02]"
                    : "hover:border-green-700/30 hover:shadow-sm"
                }
            `}
        >
            {/* Urgency left-border accent */}
            {isUrgent && (
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-destructive rounded-l-md" />
            )}
            {isDueSoon && !isUrgent && (
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-amber-500 rounded-l-md" />
            )}

            <div className="flex items-start gap-4">


                {/* Main content */}
                <div className="flex-1 min-w-0">

                    {/* Row 1: Title + badge + metrics inline */}
                    <div className="flex items-center gap-6 flex-wrap">

                        {/* Title block */}
                        <div className="flex items-center gap-2 min-w-0">
                            <h3 className="font-semibold text-base text-foreground tracking-tight truncate">
                                {item.itemName}
                            </h3>
                            <Badge
                                variant={statusVariant}
                                className="text-[9px] uppercase tracking-widest px-1.5 py-0 h-4 shrink-0"
                            >
                                {item.status}
                            </Badge>
                        </div>

                        {/* Metrics inline */}
                        <div className="flex items-center gap-5 ml-auto shrink-0">
                            <div className="text-right">
                                <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Requested</p>
                                <p className="font-mono text-sm font-bold text-foreground leading-none">
                                    {requestedQty.toLocaleString()}
                                    <span className="text-[10px] font-normal text-muted-foreground ml-1">{item.unit}</span>
                                </p>
                            </div>
                            <div className="w-px h-6 bg-border" />
                            <div className="text-right">
                                <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">In Stock</p>
                                <p className={`font-mono text-sm font-bold leading-none ${stockColor}`}>
                                    {inventoryQty.toLocaleString()}
                                    <span className="text-[10px] font-normal text-muted-foreground ml-1">{item.unit}</span>
                                </p>
                            </div>
                            <div className="w-px h-6 bg-border" />
                            <div className="text-right">
                                <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Order In</p>
                                <p className={`font-mono text-sm font-bold leading-none ${daysColor}`}>
                                    {item.daysTillOrder}
                                    <span className="text-[10px] font-normal text-muted-foreground ml-1">days</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Project + phase context */}
                    <p className="text-xs text-muted-foreground mt-1">
                        <span className="font-medium text-foreground">{item.projectName}</span>
                        <span className="mx-1.5 text-border">·</span>
                        {item.phaseName}
                    </p>

                    {/* Row 3: Actions */}
                    <div className="flex items-center gap-2 mt-3 flex-wrap">

                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs px-3"
                        >
                            Order Externally
                        </Button>

                        <Button
                            variant={hasSufficientStock ? "default" : "outline"}
                            size="sm"
                            disabled={hasNoStock}
                            className={`h-7 text-xs px-3 ${hasSufficientStock ? "bg-green-700 hover:bg-green-800 text-white" : ""}`}
                        >
                            Use Full Stock
                        </Button>

                        {/* Split order — only shown when partial stock makes sense */}
                        {(hasPartialStock || hasSufficientStock) && (
                            <div className="flex items-center gap-1.5 ml-auto">
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Split:</span>
                                <Input
                                    type="number"
                                    min={0}
                                    max={inventoryQty}
                                    value={warehouseQty}
                                    onChange={(e) => setWarehouseQty(e.target.value)}
                                    className="w-16 h-7 text-xs font-mono px-2"
                                    placeholder="0"
                                />
                                <span className="text-[10px] text-muted-foreground">{item.unit}</span>
                                <Button
                                    size="sm"
                                    className="h-7 text-xs px-3 bg-green-700 hover:bg-green-800 text-white whitespace-nowrap"
                                >
                                    Split ({toOrderQty} {item.unit} to order)
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default AdminDashboardCard;