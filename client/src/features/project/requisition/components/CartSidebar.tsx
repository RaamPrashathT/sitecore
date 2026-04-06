import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
} from "@/components/ui/sidebar";
import { useCartData } from "../hooks/cartStore";
import CartSidebarItem from "./CartSidebarItem";
import { Button } from "@/components/ui/button";
import { useMembership } from "@/hooks/useMembership";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useGetRequisitionCatalogue } from "../hooks/useGetRequisitionCatalogue";
import { useCreateRequisition } from "../hooks/useCreateRequisition";
import { Input } from "@/components/ui/input";
import { formatIndianCurrency } from "./TotalItemCount"; // Import the new formatter!

const CartSidebar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
    const [error, setError] = useState<string | null>(null);
    const [title, setTitle] = useState<string>("");

    const cartItems = useCartData((state) => state.items);
    const getTotalCost = useCartData((state) => state.getTotalCost());
    const clearCart = useCartData((state) => state.clearCart);

    const { projectSlug, phaseSlug } = useParams();
    const navigate = useNavigate();

    const { data: membership, isLoading: membershipLoading } = useMembership();
    const { data: requisitionData, isLoading: phaseLoading } = useGetRequisitionCatalogue(phaseSlug);
    const { mutateAsync: createRequisition, isPending: isLoading } = useCreateRequisition();

    if (membershipLoading || phaseLoading) {
        return (
            <Sidebar collapsible="none" className="fixed right-0 top-16 z-20 hidden border-l lg:flex w-80 h-[calc(100vh-4rem)] p-4 bg-slate-50">
                <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500">
                    <Spinner/>
                    <span className="text-sm font-medium tracking-wide uppercase">Loading...</span>
                </div>
            </Sidebar>
        );
    }

    if (!membership || !projectSlug || !phaseSlug || !requisitionData) {
        return <div className="p-4 text-red-500 text-sm">Missing route or access data</div>;
    }

    const remainingBudget = requisitionData.phase.remainingBudget;
    const isOverBudget = getTotalCost > remainingBudget;

    const handleSubmit = async () => {
        setError(null);

        if (!title.trim()) {
            setError("Requisition Title is required.");
            return;
        }
        if (isOverBudget) {
            setError(`Exceeds remaining budget (₹${formatIndianCurrency(remainingBudget)})`);
            return;
        }
        if (cartItems.length === 0) {
            setError("Cart is empty.");
            return;
        }

        const payloadItems = cartItems.map((item) => ({
            catalogueId: item.catalogueId,
            quantity: item.quantity,
            estimatedUnitCost: item.rate,
            assignedSupplierId: item.supplierId,
        }));

        try {
            await createRequisition({
                phaseId: requisitionData.phase.id, 
                payload: { title: title.trim(), items: payloadItems },
            });
            clearCart();
            navigate(`/${membership.slug}/${projectSlug}/requisitions`);
        } catch (error: any) {
            console.log(error);
            setError(error.response?.data?.message || "Transaction failed.");
        }
    };

    return (
        <Sidebar
            collapsible="none"
            className="fixed right-0 top-16 z-20 hidden border-l border-slate-200 bg-slate-50 lg:flex w-80 h-[calc(100vh-4rem)] shadow-sm"
            {...props}
        >
            <SidebarHeader className="pb-0 pt-6 px-5 bg-slate-50">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    Selected Items
                </h2>
            </SidebarHeader>
            
            <SidebarContent className="px-3 mt-4 bg-slate-50">
                <div className="px-2 mb-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 block">
                        Requisition Title
                    </label>
                    <Input 
                        placeholder="e.g. Phase 1 Electrical..." 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full text-sm bg-white border-slate-200 focus-visible:ring-slate-200 shadow-sm"
                    />
                </div>

                <div className="px-2 pb-4">
                    {cartItems.map((item) => (
                        <CartSidebarItem
                            key={`${item.catalogueId}-${item.supplierId}`}
                            {...item}
                        />
                    ))}
                    {cartItems.length === 0 && (
                        <div className="flex flex-col items-center justify-center text-center py-12 px-4 opacity-70">
                            <p className="text-sm text-slate-500 font-medium">Your cart is empty</p>
                            <p className="text-xs text-slate-400 mt-1">Select items from the catalogue to begin.</p>
                        </div>
                    )}
                </div>
            </SidebarContent>

            <SidebarFooter className="border-t border-slate-200 bg-white p-5">
                <div className="flex flex-col gap-1.5 mb-4">
                    <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-500 uppercase tracking-wider">Available Budget</span>
                        {/* Applied Formatter */}
                        <span className="font-mono text-slate-600 whitespace-nowrap">
                            ₹ {formatIndianCurrency(remainingBudget)}
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-t border-slate-100 pt-1.5 mt-0.5">
                        <span className="font-bold text-slate-700 uppercase tracking-wider">Total</span>
                        {/* Applied Formatter */}
                        <span className={`font-mono font-bold whitespace-nowrap ${isOverBudget ? 'text-red-600' : 'text-green-700'}`}>
                            ₹ {formatIndianCurrency(getTotalCost)}
                        </span>
                    </div>
                </div>

                <Button
                    onClick={handleSubmit}
                    disabled={isLoading || cartItems.length === 0 || isOverBudget}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-sm"
                >
                    {isLoading ? (
                        <div className="flex items-center gap-x-2">
                            <Spinner className="text-white h-4 w-4" />
                            <span>Processing...</span>
                        </div>
                    ) : (
                        "Generate Requisition"
                    )}
                </Button>
                
                {error && (
                    <p className="text-red-600 text-[10px] font-bold uppercase tracking-wider mt-2 text-center">
                        {error}
                    </p>
                )}
            </SidebarFooter>
        </Sidebar>
    );
};

export default CartSidebar;