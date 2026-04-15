import { SidebarProvider } from "@/components/ui/sidebar";
import CartSidebar from "@/features/project/requisition/components/CartSidebar";
import RequisitionSelectionMain from "@/features/project/requisition/components/RequisitionSelectionMain";
import { useCartData } from "@/features/project/requisition/hooks/cartStore";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useProjectDetails } from "@/features/project/details/hooks/useProjectDetails";

const RequisitionCreationPage = () => {
    const clearCart = useCartData(state => state.clearCart);
    const { orgSlug, projectSlug } = useParams<{ orgSlug: string; projectSlug: string }>();
    const { data: project, isLoading: isProjectLoading } = useProjectDetails(orgSlug, projectSlug);
    const isProjectActive = project?.status === "ACTIVE";
    
    // 👇 The floating clearCart() that used to be here MUST be deleted.

    useEffect(() => {
        // Clear cart on mount
        clearCart();

        // Clear cart on unmount
        return () => {
            clearCart();
        }
    }, [clearCart])

    if (isProjectLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50 px-6 text-stone-500">
                Loading project state...
            </div>
        );
    }

    if (project && !isProjectActive) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50 px-6 text-center">
                <div className="max-w-xl rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-900">
                    <h1 className="text-2xl font-semibold">Project is not active</h1>
                    <p className="mt-2 text-sm text-amber-800">
                        Requisition creation is locked until the project becomes ACTIVE.
                    </p>
                </div>
            </div>
        );
    }

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