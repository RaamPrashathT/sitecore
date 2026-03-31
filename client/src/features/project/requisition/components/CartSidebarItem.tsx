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
        <div className="flex flex-col gap-y-2 p-2 last:border-none border-b">
            <div className="flex items-center justify-between">
                <p>
                    {name} : {supplierName}
                </p>
                <Button onClick={() => removeItem({ catalogueId, supplierId })} variant={"ghost"} size={"sm"} className="hover:bg-transparent">
                    <X  />
                </Button>
            </div>
            <div className="flex items-center justify-between "> 
                <QuantityActionRow
                    catalogueId={catalogueId}
                    supplierId={supplierId}
                    name={name}
                    supplierName={supplierName}
                    unit={unit}
                    rate={rate}
                    variant={"compact"}
                />
                <div>
                    <TotalItemCount
                        catalogueId={catalogueId}
                        supplierId={supplierId}
                        rate={rate}
                    />
                </div>
            </div>
        </div>
    );
};

export default CartSidebarItem;
