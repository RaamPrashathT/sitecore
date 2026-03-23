import { Button } from "@/components/ui/button";
import { useMembership } from "@/hooks/useMembership";
import { useApprovePendingPayment } from "../hooks/useApprovePayment";

interface ApprovePaymentButtonProps {
    id: string;
}

const ApprovePaymentButton = ({ id }: ApprovePaymentButtonProps) => {
    const { data: membership, isLoading: membershipLoading } = useMembership();
    const { mutate, isPending } = useApprovePendingPayment(membership?.id);
    if (membershipLoading || isPending) return <div>Loading...</div>;
    if (!membership) return <div>No access</div>;

    const handleApprove = async (id: string) => {
        mutate({
            phaseId: id,
        });
    };
    return <Button onClick={() => handleApprove(id)}>Approve</Button>;
};

export default ApprovePaymentButton;
