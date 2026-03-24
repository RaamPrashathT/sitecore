import { Button } from "@/components/ui/button";
import { useMembership } from "@/hooks/useMembership";
import { useAssignRole } from "../hooks/useAssignRole";

interface ClientAssignButtonProps {
    userId: string;
}

const ClientAssignButton = ({ userId }: ClientAssignButtonProps) => {
    const { data: membership, isLoading: membershipLoading } = useMembership();
    const { mutate, isPending, isError } = useAssignRole(membership?.id);

    if (membershipLoading || isPending) {
        return <div>Loading...</div>;
    }

    if (!membership || isError) {
        return <div>No membership found</div>;
    }
    const assignAsClient = async () => {
        mutate({
            userId,
            role: "CLIENT",
        });
    };

    return (
        <div>
            <Button onClick={assignAsClient}>Assign as Client</Button>
        </div>
    );
};

export default ClientAssignButton;
