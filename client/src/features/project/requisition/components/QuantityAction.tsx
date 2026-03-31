import { Button } from "@/components/ui/button";
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
            addItem({
                catalogueId,
                supplierId,
                name,
                supplierName,
                unit,
                rate,
                quantity: 1,
            });
        } else {
            updateQuantity({
                catalogueId,
                supplierId,
                quantity: quantity + 1,
            });
        }
    };

    const handleDecrement = () => {
        if (!catalogueId || !supplierId) {
            return;
        }
        if (quantity <= 1) {
            removeItem({
                catalogueId,
                supplierId,
            });
        } else {
            updateQuantity({
                catalogueId,
                supplierId,
                quantity: quantity - 1,
            });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const val = Math.max(0, Number.parseInt(e.target.value) || 0);

        if (val === 0) {
            removeItem({
                catalogueId,
                supplierId,
            });
        } else if (quantity === 0) {
            addItem({
                catalogueId,
                supplierId,
                name,
                supplierName,
                unit,
                rate,
                quantity: val,
            });
        } else {
            updateQuantity({
                catalogueId,
                supplierId,
                quantity: val,
            });
        }
    };

    if (variant === "compact") {
        return (
            <div className="flex items-center w-full max-w-[130px]">
                <Button
                    variant="outline"
                    size="icon"
                    className="rounded-r-none h-8 w-8 p-0 bg-transparent"
                    onClick={handleDecrement}
                >
                    <Minus size={14} />
                </Button>

                <Input
                    className="h-8 rounded-none text-center px-1 focus-visible:ring-0 focus:ring-0 focus:ring-offset-0  bg-transparent"
                    value={quantity === 0 ? "" : quantity}
                    onChange={handleChange}
                    placeholder="0"
                />

                <Button
                    variant="outline"
                    size="icon"
                    className="rounded-l-none h-8 w-8 p-0  bg-transparent"
                    onClick={handleIncrement}
                >
                    <Plus size={14} />
                </Button>
            </div>
        );
    }
    return (
        <div className="flex items-center w-full max-w-[150px]">
            <Button
                variant={"outline"}
                className="rounded-none px-2"
                onClick={handleDecrement}
            >
                <Minus size={16} />
            </Button>
            <Input
                className="focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 outline-none rounded-none text-center w-full"
                value={quantity === 0 ? "" : quantity}
                onChange={handleChange}
                placeholder="0"
            />
            <Button
                variant={"outline"}
                className="rounded-none px-2"
                onClick={handleIncrement}
            >
                <Plus size={16} />
            </Button>
        </div>
    );
};

export default QuantityActionRow;
