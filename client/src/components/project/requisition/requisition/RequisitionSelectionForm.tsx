import { useGetCatalogue } from "@/hooks/useGetCatalogs";
import { useMembership } from "@/hooks/useMembership";
import RequisitionSelectDataTable from "./DataTable";

const RequisitionSelectionForm = () => {
    const {data: memembership, isLoading: membershipLoading} = useMembership();
    const {data: catalogue, isLoading: catalogueLoading} = useGetCatalogue(memembership?.id);

    if(membershipLoading || catalogueLoading){
        return <div>Loading...</div>
    }

    if(!memembership || !catalogue){
        return <div>No access</div>
    }

    return (
        <div className="p-2">
            <h1 className="text-2xl font-semibold">Select Requisitions:</h1>
            <div>
                <RequisitionSelectDataTable data={catalogue}/>
            </div>
        </div>
    );
};

export default RequisitionSelectionForm;
