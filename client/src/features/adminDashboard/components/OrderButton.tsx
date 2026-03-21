import { Button } from "@/components/ui/button";
import { useSetDashboardItems } from "../hooks/useSetDashboardItems";
import { useMembership } from "@/hooks/useMembership";
import { Loader2 } from "lucide-react";

interface OrderButtonProps {
    selectedIds: string[];
    clearSelection: () => void;
}

const OrderButton = ({ selectedIds, clearSelection }: OrderButtonProps) => {
    const { data: membership } = useMembership();
    const { mutate, isPending } = useSetDashboardItems(membership?.id);

    const handleOrder = () => {
        if (selectedIds.length === 0) return;
        
        mutate(
            { requisitionItemIds: selectedIds },
            {
                onSuccess: () => {
                    clearSelection();
                }
            }
        );
    };

    return (
        <Button 
            onClick={handleOrder} 
            disabled={selectedIds.length === 0 || isPending}
            className="w-40"
        >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Order Selected
        </Button>
    );
};

export default OrderButton;