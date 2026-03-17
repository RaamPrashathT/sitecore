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
import { useProjectDetails } from "@/hooks/useProjectDetails";
import { useNavigate, useParams } from "react-router-dom";
import { useRequisitionDetails } from "@/hooks/useRequisitionDetails";
import { useState } from "react";
import api from "@/lib/axios";
import { Spinner } from "@/components/ui/spinner";

const CartSidebar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const cartItems = useCartData((state) => state.items);
    const getTotalCost = useCartData((state) => state.getTotalCost());
    const { projectSlug, requisitionIdSlug } = useParams();
    const navigate = useNavigate();

    const { data: membership, isLoading: membershipLoading } = useMembership();
    const { data: projectDetails, isLoading: projectDetailsLoading } =
        useProjectDetails(projectSlug, membership?.id);
    const { data: RequisitionDetails, isLoading: RequisitionDetailsLoading } =
        useRequisitionDetails(
            requisitionIdSlug,
            membership?.id,
            projectDetails?.id,
        );
    if (
        membershipLoading ||
        projectDetailsLoading ||
        RequisitionDetailsLoading
    ) {
        return <div>Loading...</div>;
    }

    if (
        !membership ||
        !projectDetails ||
        !projectSlug ||
        !requisitionIdSlug ||
        !RequisitionDetails
    ) {
        return <div>No access</div>;
    }

    const handleSubmit = () => {
        setError(null);
        setIsLoading(true);
        if (getTotalCost > RequisitionDetails?.budget) {
            setError("Budget exceeded");
            return;
        }
        if (cartItems.length === 0) {
            setError("No items in cart");
            return;
        }

        const cartItemsArray = cartItems.map((item) => ({
            catalogueId: item.catalogueId,
            supplierId: item.supplierId,
            quantity: item.quantity,
            estimatedCost: item.rate * item.quantity,
        }));

        const payload = {
            cartItems: cartItemsArray,
            requisitionId: RequisitionDetails?.id,
            totalCost: getTotalCost,
        };

        try {
            console.log(payload);
            const result = api.post("/project/phase/requisitionItems", payload, {
                headers: {
                    "x-organization-id": membership?.id,
                    "x-project-id": projectDetails?.id,
                }
            })
            console.log(result);
            navigate(`/${membership.slug}/${projectSlug}/`)
        } catch (error) {
            console.log(error);
            setError("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Sidebar
            collapsible="none"
            className="fixed right-0 top-16 z-20 hidden border-l lg:flex w-80 h-[calc(100vh-4rem)]"
            {...props}
        >
            <SidebarHeader className="text-2xl font-semibold pb-0">
                Cart:
            </SidebarHeader>
            <SidebarContent>
                {cartItems.map((item) => (
                    <CartSidebarItem
                        key={item.catalogueId}
                        catalogueId={item.catalogueId}
                        supplierId={item.supplierId}
                        name={item.name}
                        supplierName={item.supplierName}
                        unit={item.unit}
                        rate={item.rate}
                    />
                ))}
            </SidebarContent>
            <SidebarFooter className="border-t">
                <div className="text-xl font-semibold flex flex-col gap-y-2 tabular-nums mb-2">
                    <p className="flex justify-between">
                        <span>Total Cost:</span>
                        <span>{getTotalCost}</span>
                    </p>

                    <p className="flex justify-between">
                        <span>Budget:</span>
                        <span>{RequisitionDetails?.budget}</span>
                    </p>
                </div>
                <Button onClick={handleSubmit}>
                    {isLoading ? (
                        <div className="flex items-center gap-x-2">
                            <Spinner />
                            <p>Submitting...</p>
                        </div>
                    ) : (
                        "Submit"
                    )}
                </Button>
                {error && <p className="text-red-500">{error}</p>}
            </SidebarFooter>
        </Sidebar>
    );
};

export default CartSidebar;
