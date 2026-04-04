import { useCartData } from "../hooks/cartStore";

interface TotalItemCountProps {
    readonly catalogueId: string;
    readonly supplierId: string;
    readonly rate: number;
}

// Utility to format large numbers into Lakhs and Crores
export const formatIndianCurrency = (value: number) => {
    if (value >= 10000000) {
        return (value / 10000000).toFixed(2) + " Cr";
    } else if (value >= 100000) {
        return (value / 100000).toFixed(2) + " L";
    }
    // en-IN ensures standard comma placement for thousands (e.g., 99,999.00)
    return value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const TotalItemCount = ({
    catalogueId,
    supplierId,
    rate
}: TotalItemCountProps) => {
    const cartItem = useCartData(state => 
        state.items.find(item => item.catalogueId === catalogueId && item.supplierId === supplierId)
    );
    
    const total = (cartItem?.quantity || 0) * Number(rate);
    
    return (
        <>{total > 0 ? formatIndianCurrency(total) : "0.00"}</>
    );
};

export default TotalItemCount;