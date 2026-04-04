import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";
import { useCartData } from "../hooks/cartStore";

interface QuantityActionRowProps {
    readonly catalogueId: string;
    readonly supplierId: string;
    readonly supplierName: string;
    readonly name: string;
    readonly unit: string;
    readonly rate: number;
    readonly variant?: "general" | "compact";
}

const QuantityActionRow = ({
    catalogueId,
    supplierId,
    supplierName,
    name,
    unit,
    rate,
    variant = "general",
}: QuantityActionRowProps) => {
    const cartItem = useCartData((state) =>
        state.items.find(
            (item) =>
                item.catalogueId === catalogueId &&
                item.supplierId === supplierId,
        ),
    );

    const addItem = useCartData((state) => state.addItem);
    const removeItem = useCartData((state) => state.removeItem);
    const updateQuantity = useCartData((state) => state.updateQuantity);

    const quantity = cartItem?.quantity || 0;

    const handleIncrement = () => {
        if (quantity === 0) {
            addItem({ catalogueId, supplierId, name, supplierName, unit, rate, quantity: 1 });
        } else {
            updateQuantity({ catalogueId, supplierId, quantity: quantity + 1 });
        }
    };

    const handleDecrement = () => {
        if (!catalogueId || !supplierId) return;
        if (quantity <= 1) {
            removeItem({ catalogueId, supplierId });
        } else {
            updateQuantity({ catalogueId, supplierId, quantity: quantity - 1 });
        }
    };

    // Restored your original handleChange logic
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        // Allow parsing of the typed value, default to 0 if empty/invalid
        const val = Math.max(0, Number.parseInt(e.target.value) || 0);

        if (val === 0) {
            removeItem({ catalogueId, supplierId });
        } else if (quantity === 0) {
            addItem({ catalogueId, supplierId, name, supplierName, unit, rate, quantity: val });
        } else {
            updateQuantity({ catalogueId, supplierId, quantity: val });
        }
    };

    const isCompact = variant === "compact";

    return (
        <div className={`flex items-center justify-center gap-x-${isCompact ? '1' : '3'}`}>
            <button
                onClick={handleDecrement}
                className="text-slate-400 hover:text-emerald-700 transition-transform active:scale-90 p-1"
            >
                <Minus size={isCompact ? 14 : 18} strokeWidth={2.5} />
            </button>
            
            {/* Restored Input but styled to look like plain text until focused */}
            <Input
                type="text"
                inputMode="numeric"
                value={quantity === 0 ? "" : quantity}
                onChange={handleChange}
                placeholder="0"
                className={`
                    ${isCompact ? 'w-10 h-7 text-sm' : 'w-12 h-8 text-base'} 
                    text-center font-mono border-none shadow-none bg-transparent 
                    outline-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 
                    ${quantity > 0 ? 'text-emerald-700 font-bold' : 'text-slate-400 font-medium'}
                `}
            />

            <button
                onClick={handleIncrement}
                className="text-slate-400 hover:text-emerald-700 transition-transform active:scale-90 p-1"
            >
                <Plus size={isCompact ? 14 : 18} strokeWidth={2.5} />
            </button>
        </div>
    );
};

export default QuantityActionRow;