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
import api from "@/lib/axios";
import { Spinner } from "@/components/ui/spinner";
import { useGetPhaseDetails } from "@/features/project/progress/hooks/useProjectProgress";

const CartSidebar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const cartItems = useCartData((state) => state.items);
    const getTotalCost = useCartData((state) => state.getTotalCost());
    const clearCart = useCartData((state) => state.clearCart);

    const { projectSlug, phaseId } = useParams();
    const navigate = useNavigate();

    const { data: membership, isLoading: membershipLoading } = useMembership();

    const { data: phaseDetails, isLoading: phaseLoading } = useGetPhaseDetails(
        phaseId,
        projectSlug,
        membership?.id,
    );

    if (membershipLoading || phaseLoading) {
        return (
            <Sidebar
                collapsible="none"
                className="fixed right-0 top-16 z-20 hidden border-l lg:flex w-80 h-[calc(100vh-4rem)] p-4"
            >
                <div className="flex items-center gap-2 text-slate-500">
                    <Spinner /> Loading cart...
                </div>
            </Sidebar>
        );
    }

    if (!membership || !projectSlug || !phaseId || !phaseDetails) {
        return (
            <div className="p-4 text-red-500">Missing route or access data</div>
        );
    }

    const phaseSnapshot = phaseDetails.phaseSnapshot;
    const remainingBudget = phaseSnapshot.budget - phaseSnapshot.spent;

    const handleSubmit = async () => {
        setError(null);
        setIsLoading(true);

        if (getTotalCost > remainingBudget) {
            setError(
                `Cost exceeds remaining phase budget (₹${remainingBudget})`,
            );
            setIsLoading(false);
            return;
        }
        if (cartItems.length === 0) {
            setError("No items in cart");
            setIsLoading(false);
            return;
        }

        const payloadItems = cartItems.map((item) => ({
            catalogueId: item.catalogueId,
            quantity: item.quantity,
            estimatedUnitCost: item.rate,
            assignedSupplierId: item.supplierId,
        }));

        try {
            await api.post(
                `/project/phase/${phaseId}/requisition`,
                { items: payloadItems },
                {
                    headers: {
                        "x-organization-id": membership?.id,
                        "x-project-slug": projectSlug,
                    },
                },
            );
            clearCart();
            navigate(`/${membership.slug}/${projectSlug}/`);
        } catch (error: any) {
            console.log(error);
            setError(error.response?.data?.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Sidebar
            collapsible="none"
            className="fixed right-0 top-16 z-20 hidden border-l bg-white lg:flex w-80 h-[calc(100vh-4rem)]"
            {...props}
        >
            <SidebarHeader className="text-xl font-bold text-slate-900 pb-0 pt-4 px-4">
                Current Order
            </SidebarHeader>
            <SidebarContent className="px-2">
                {cartItems.map((item) => (
                    <CartSidebarItem
                        key={`${item.catalogueId}-${item.supplierId}`}
                        catalogueId={item.catalogueId}
                        supplierId={item.supplierId}
                        name={item.name}
                        supplierName={item.supplierName}
                        unit={item.unit}
                        rate={item.rate}
                    />
                ))}
                {cartItems.length === 0 && (
                    <div className="text-sm text-slate-500 text-center py-10">
                        Add materials from the catalogue to begin.
                    </div>
                )}
            </SidebarContent>
            <SidebarFooter className="border-t p-4 bg-slate-50">
                <div className="text-sm font-medium flex flex-col gap-y-2 mb-4 text-slate-700">
                    <p className="flex justify-between items-center">
                        <span>Remaining Budget:</span>
                        <span className="font-semibold text-slate-900">
                            ₹{remainingBudget.toLocaleString()}
                        </span>
                    </p>
                    <p className="flex justify-between items-center text-base border-t border-slate-200 pt-2 mt-1">
                        <span className="font-bold text-slate-900">
                            Total Cost:
                        </span>
                        <span
                            className={`font-bold ${getTotalCost > remainingBudget ? "text-red-600" : "text-green-700"}`}
                        >
                            ₹{getTotalCost.toLocaleString()}
                        </span>
                    </p>
                </div>

                <Button
                    onClick={handleSubmit}
                    disabled={
                        isLoading ||
                        cartItems.length === 0 ||
                        getTotalCost > remainingBudget
                    }
                    className="w-full bg-green-700 hover:bg-green-800 text-white"
                >
                    {isLoading ? (
                        <div className="flex items-center gap-x-2">
                            <Spinner className="text-white" />
                            <span>Submitting...</span>
                        </div>
                    ) : (
                        "Submit Order"
                    )}
                </Button>
                {error && (
                    <p className="text-red-600 text-xs font-semibold mt-2 text-center">
                        {error}
                    </p>
                )}
            </SidebarFooter>
        </Sidebar>
    );
};

export default CartSidebar;
