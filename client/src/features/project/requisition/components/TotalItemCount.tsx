import { useCartData } from "../hooks/cartStore";

interface TotalItemCountProps {
    readonly catalogueId: string;
    readonly supplierId: string;
    readonly rate: number;
}

const TotalItemCount = ({
    catalogueId,
    supplierId,
    rate
}: TotalItemCountProps) => {
    const cartItem = useCartData(state => 
        state.items.find(item => item.catalogueId === catalogueId && item.supplierId === supplierId)
    )
    const total = (cartItem?.quantity || 0) * Number(rate);
    return (
        <div>
            <p>{(total > 0) ? total.toFixed(2) : 0}</p>
        </div>
    );
};

export default TotalItemCount;
