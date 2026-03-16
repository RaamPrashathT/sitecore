import DataTable from "@/components/engineers/table/DataTable";
import { useEngineers } from "@/hooks/useEngineers";
import { useMembership } from "@/hooks/useMembership";

const EngineerPage = () => {
    const { data: membership, isLoading: membershipLoading } = useMembership();
    
    const { data: engineers, isLoading: engineersLoading } = useEngineers(membership?.id);
    
    if (membershipLoading || engineersLoading) {
        return <div>Loading...</div>;
    }
    
    if (!membership || !engineers) {
        return <div>No access</div>;
    
    }

    return (
        <div className="px-4"> 
            <DataTable data={engineers}/>
        </div>
    )
}

export default EngineerPage