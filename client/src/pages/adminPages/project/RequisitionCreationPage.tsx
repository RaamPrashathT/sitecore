import { SidebarProvider } from "@/components/ui/sidebar";
import CartSidebar from "@/features/project/requisition/components/CartSidebar";
import RequisitionSelectionForm from "@/features/project/requisition/components/RequisitionSelectionForm";
import { useCartData } from "@/features/project/requisition/hooks/cartStore";
import { useEffect } from "react";

const RequisitionCreationPage = () => {
    const clearCart = useCartData(state => state.clearCart);
    clearCart();

    useEffect(() => {
        clearCart();

        return () => {
            clearCart();
        }
    }, [clearCart])

    return (
        <SidebarProvider className="min-h-0 h-full w-full">
            <main className="flex-1 min-h-0 overflow-auto lg:pr-80">
                <RequisitionSelectionForm />
            </main>
            <CartSidebar side="right" />
        </SidebarProvider>
    );
};

export default RequisitionCreationPage;
