import { Button } from "@/components/ui/button";
import { useCartData } from "../hooks/cartStore";
import QuantityActionRow from "./QuantityAction";
import TotalItemCount from "./TotalItemCount";
import { X } from "lucide-react";

interface CartSidebarItemProps {
    readonly catalogueId: string;
    readonly supplierId: string;
    readonly supplierName: string;
    readonly name: string;
    readonly unit: string;
    readonly rate: number;
}

const CartSidebarItem = ({
    catalogueId,
    supplierId,
    name,
    supplierName,
    unit,
    rate,
}: CartSidebarItemProps) => {
    const removeItem = useCartData((state) => state.removeItem);

    return (
        <div className="flex flex-col py-3 border-b border-slate-200/60 last:border-none">
            {/* Top Row: Name · Supplier and Remove */}
            <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-slate-800 text-sm leading-tight pr-4">
                    {name} <span className="text-slate-500 font-normal">· {supplierName}</span>
                </h3>
                <Button 
                    onClick={() => removeItem({ catalogueId, supplierId })} 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-slate-400 hover:text-red-600 hover:bg-red-50 -mt-0.5 shrink-0"
                >
                    <X size={14} strokeWidth={2.5} />
                </Button>
            </div>

            {/* Bottom Row: Controls & Total */}
            <div className="flex items-center justify-between mt-1">
                <QuantityActionRow
                    catalogueId={catalogueId}
                    supplierId={supplierId}
                    name={name}
                    supplierName={supplierName}
                    unit={unit}
                    rate={rate}
                    variant="compact"
                />
                <div className="flex items-baseline gap-1.5">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Total</span>
                    {/* Added whitespace-nowrap here to prevent line breaks! */}
                    <div className="font-mono font-semibold text-slate-900 text-sm whitespace-nowrap">
                        ₹ <TotalItemCount
                            catalogueId={catalogueId}
                            supplierId={supplierId}
                            rate={rate}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartSidebarItem;