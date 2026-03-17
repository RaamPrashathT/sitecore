import { useGetCatalogue } from "@/hooks/useGetCatalogs";
import { useMembership } from "@/hooks/useMembership";
import RequisitionDataTable from "./RequisitionDatatable";

const RequisitionSelectionForm = () => {
    const {data: membership, isLoading: membershipLoading} = useMembership();
    const {data: catalogue, isLoading: catalogueLoading} = useGetCatalogue(membership?.id);

    if(membershipLoading || catalogueLoading){
        return <div>Loading...</div>
    }

    if(!membership || !catalogue){
        return <div>No access</div>
    }

    return (
        <div className="p-2">
            <h1 className="text-2xl font-semibold mb-2 pl-2">Select Requisitions:</h1>
            <div>
                <RequisitionDataTable data={catalogue} />
            </div>
        </div>
    );
};

export default RequisitionSelectionForm;
