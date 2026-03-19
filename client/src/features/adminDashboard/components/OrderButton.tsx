import { Button } from "@/components/ui/button";
import { Forklift } from "lucide-react";

const OrderButton = () => {
    return (
        <div>
            <Button className="w-40">
                <Forklift />
                <p>Order</p>
            </Button>
        </div>
    );
};

export default OrderButton;
