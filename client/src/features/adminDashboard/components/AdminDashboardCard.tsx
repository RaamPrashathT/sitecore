import { useState } from "react";
import type { DashboardItemType } from "../hooks/useGetDashboardItems";
import type { Row } from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMembership } from "@/hooks/useMembership";
import { useOrderDashboardItem } from "../hooks/useOrderDashboardItem";
import { Dot, Loader2 } from "lucide-react";

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

    // Default to "0"
    const [warehouseQty, setWarehouseQty] = useState<string>("0");
    
    // Evaluate input for error states
    const rawInput = Number(warehouseQty) || 0;
    const isExceedingStock = rawInput > usableInventory;
    const isExceedingRequested = rawInput > requestedQty;
    const hasError = isExceedingStock || isExceedingRequested;

    let errorMessage = "";
    if (isExceedingStock) errorMessage = "Exceeds stock";
    else if (isExceedingRequested) errorMessage = "Exceeds requested";

    const parsedWarehouse = Math.max(0, Math.min(rawInput, usableInventory, requestedQty));
    const toOrderQty = Math.max(0, requestedQty - parsedWarehouse);

    const hasSufficientStock = usableInventory >= requestedQty && requestedQty > 0;
    const hasPartialStock = usableInventory > 0 && usableInventory < requestedQty;
    const hasNoStock = usableInventory <= 0;

    // Handlers
    const handleOrderExternally = () => mutate({ requisitionItemId: item.id, deductInventoryQty: 0 });
    const handleUseFullStock = () => mutate({ requisitionItemId: item.id, deductInventoryQty: requestedQty });
    const handleSplitOrder = () => mutate({ requisitionItemId: item.id, deductInventoryQty: parsedWarehouse });

    const isUrgent = item.daysTillOrder <= 3;
    const isDueSoon = item.daysTillOrder <= 7 && item.daysTillOrder > 3;
    
    const stockColor = hasSufficientStock ? "text-green-700" : hasNoStock ? "text-destructive" : "text-amber-600";
    const daysColor = isUrgent ? "text-destructive" : isDueSoon ? "text-amber-600" : "text-foreground";
    const statusVariant = item.status === "URGENT" ? "destructive" : item.status === "DUE" ? "default" : "secondary";

    return (
        <Card className={`relative overflow-hidden p-4 sm:px-5 sm:py-4 transition-all duration-150 hover:border-green-700/30 hover:shadow-sm ${isPending ? "opacity-50 pointer-events-none" : ""}`}>
            
            <div className="flex flex-col gap-5 min-w-0 ml-1 sm:ml-2">
                
                {/* TOP ROW: Info & Metrics */}
                <div className="flex flex-col xl:flex-row justify-between items-start gap-4 xl:gap-8">
                    
                    {/* INFO BLOCK: Title, Project, Supplier */}
                    <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-base text-foreground tracking-tight truncate flex gap-x-0">
                                {item.itemName} <Dot className="pt-px"/> {item.supplierName}
                            </h3>
                            <Badge variant={statusVariant} className="text-[9px] uppercase tracking-widest px-1.5 py-0 h-4 shrink-0">
                                {item.status}
                            </Badge>
                        </div>
                        
                        <div className="text-sm text-muted-foreground flex flex-col gap-0.5 mt-0.5">
                            <p className="truncate">
                                <span className="font-medium text-foreground">{item.projectName}</span>
                                <span className="mx-1.5 text-border">·</span>
                                {item.phaseName}
                            </p>
                        </div>
                    </div>

                    {/* METRICS BLOCK: Requested, In Stock, Order In */}
                    <div className="flex items-center justify-between xl:justify-end gap-4 w-full xl:w-auto shrink-0 bg-muted/30 xl:bg-transparent p-3 xl:p-0 rounded-lg border border-border/40 xl:border-0">
                        <div className="text-left xl:text-right flex-1 xl:flex-none">
                            <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Requested</p>
                            <p className="font-mono text-sm font-bold text-foreground leading-none">
                                {requestedQty.toLocaleString('en-IN')}
                                <span className="text-[10px] font-normal text-muted-foreground ml-1">{item.unit}</span>
                            </p>
                        </div>
                        <div className="w-px h-6 bg-border hidden sm:block" />
                        <div className="text-center xl:text-right flex-1 xl:flex-none">
                            <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">In Stock</p>
                            <p className={`font-mono text-sm font-bold leading-none ${stockColor}`}>
                                {rawInventory.toLocaleString('en-IN')}
                                <span className="text-[10px] font-normal text-muted-foreground ml-1">{item.unit}</span>
                            </p>
                        </div>
                        <div className="w-px h-6 bg-border hidden sm:block" />
                        <div className="text-right flex-1 xl:flex-none">
                            <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Order In</p>
                            <p className={`font-mono text-sm font-bold leading-none ${daysColor}`}>
                                {item.daysTillOrder}
                                <span className="text-[10px] font-normal text-muted-foreground ml-1">days</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* BOTTOM ROW: Actions (Flex-1 on Mobile, Auto on Desktop) */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    
                    {/* Primary Actions */}
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs px-3 flex-1 sm:flex-none"
                            onClick={handleOrderExternally}
                            disabled={isPending}
                        >
                            Order Externally
                        </Button>

                        <Button
                            variant={hasSufficientStock ? "default" : "outline"}
                            size="sm"
                            disabled={!hasSufficientStock || isPending}
                            onClick={handleUseFullStock}
                            className={`h-8 text-xs px-3 flex-1 sm:flex-none ${hasSufficientStock ? "bg-green-700 hover:bg-green-800 text-white" : ""}`}
                        >
                            Use Full Stock
                        </Button>
                    </div>

                    {/* Split Order Action */}
                    {(hasPartialStock || hasSufficientStock) && (
                        <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto bg-muted/30 sm:bg-transparent p-2 sm:p-0 rounded-lg border border-border/40 sm:border-0 relative">
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider shrink-0">
                                Split:
                            </span>
                            
                            <div className="relative flex-1 sm:flex-none">
                                <Input
                                    type="number"
                                    min={0}
                                    value={warehouseQty}
                                    onChange={(e) => setWarehouseQty(e.target.value)}
                                    className={`w-full sm:w-16 h-8 text-xs font-mono px-2 ${hasError ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                    placeholder="0"
                                    disabled={isPending}
                                />
                                {hasError && (
                                    <span className="absolute -bottom-4 left-0 text-[9px] text-destructive whitespace-nowrap font-medium">
                                        {errorMessage}
                                    </span>
                                )}
                            </div>

                            <span className="text-[10px] text-muted-foreground shrink-0 w-6">
                                {item.unit}
                            </span>
                            
                            <Button
                                size="sm"
                                onClick={handleSplitOrder}
                                disabled={isPending || rawInput === 0 || hasError}
                                className="h-8 text-xs px-3 flex-1 sm:flex-none shrink-0 bg-green-700 hover:bg-green-800 text-white whitespace-nowrap"
                            >
                                {isPending ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : null}
                                Split ({hasError ? "-" : toOrderQty} {item.unit} to order)
                            </Button>
                        </div>
                    )}
                </div>

            </div>
        </Card>
    );
};

export default AdminDashboardCard;