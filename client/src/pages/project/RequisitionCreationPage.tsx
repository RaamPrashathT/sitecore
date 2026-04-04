import { SidebarProvider } from "@/components/ui/sidebar";
import CartSidebar from "@/features/project/requisition/components/CartSidebar";
import RequisitionSelectionMain from "@/features/project/requisition/components/RequisitionSelectionMain";
import { useCartData } from "@/features/project/requisition/hooks/cartStore";
import { useEffect } from "react";

const RequisitionCreationPage = () => {
    const clearCart = useCartData(state => state.clearCart);
    
    // 👇 The floating clearCart() that used to be here MUST be deleted.

    useEffect(() => {
        // Clear cart on mount
        clearCart();

        // Clear cart on unmount
        return () => {
            clearCart();
        }
    }, [clearCart])

    return (
        <SidebarProvider className="min-h-0 h-full w-full">
            <main className="flex-1 min-h-0 overflow-auto lg:pr-80">
                <RequisitionSelectionMain />
            </main>
            <CartSidebar side="right" />
        </SidebarProvider>
    );
};

export default RequisitionCreationPage;