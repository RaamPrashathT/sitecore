import DataTable from "@/components/clients/table/DataTable";
import { useClients } from "@/hooks/useClients";
import { useMembership } from "@/hooks/useMembership";

const ClientPage = () => {
    const { data: membership, isLoading: membershipLoading } = useMembership();
    
    const { data: clients, isLoading: clientLoading } = useClients(membership?.id);
    
    if (membershipLoading || clientLoading) {
        return <div>Loading...</div>;
    }
    
    if (!membership || !clients) {
        return <div>No access</div>;
    
    }
    
    return (
        <div className="px-4"> 
            <DataTable data={clients}/>
        </div>
    )
}

export default ClientPage