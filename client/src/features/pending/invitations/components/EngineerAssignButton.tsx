import { Button } from "@/components/ui/button";
import { useMembership } from "@/hooks/useMembership";
import { useAssignRole } from "../hooks/useAssignRole";

interface EngineerAssignButtonProps {
    userId: string;
}


const EngineerAssignButton = ({userId}: EngineerAssignButtonProps) => {
    const {data: membership, isLoading: membershipLoading} = useMembership();
    const {mutate, isPending, isError} = useAssignRole(membership?.id)
    if(membershipLoading || isPending){
        return <div>Loading...</div>
    }

    if(!membership || isError){
        return <div>No membership found</div>;
    }

    const assignAsEngineer = async () => {
        mutate({
            userId,
            role: "ENGINEER"
        })
    };
    return (
        <div>
            <Button onClick={assignAsEngineer}>Assign as Engineer</Button>
        </div>
    );
};

export default EngineerAssignButton;
