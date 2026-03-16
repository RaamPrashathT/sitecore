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
import { useParams } from "react-router-dom";
import { useRequisitionDetails } from "@/hooks/useRequisitionDetails";

const CartSidebar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
    const cartItems = useCartData((state) => state.items);
    const getTotalCost = useCartData((state) => state.getTotalCost());
    const { projectSlug, requisitionIdSlug } = useParams();

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
                <Button>Submit</Button>
            </SidebarFooter>
        </Sidebar>
    );
};

export default CartSidebar;
