import { CartSidebar } from "@/components/project/requisition/cart/cartSidebar";
import RequisitionSelectionForm from "@/components/project/requisition/requisition/RequisitionSelectionForm";
import { SidebarProvider } from "@/components/ui/sidebar";

const RequisitionCreationPage = () => {
    return (
        <SidebarProvider>
            <main className="flex-1">
                <RequisitionSelectionForm />
            </main>
            <CartSidebar side="right" />
        </SidebarProvider>
    );
};

export default RequisitionCreationPage;
