import { useGetCatalogues } from "@/features/catalogue/hooks/useGetCatalogues";
import { useMembership } from "@/hooks/useMembership";
import RequisitionDataTable from "./RequisitionDatatable";

const RequisitionSelectionForm = () => {
    const {data: membership, isLoading: membershipLoading} = useMembership();
    const {data: catalogue, isLoading: catalogueLoading} = useGetCatalogues(membership?.id, 10, 1, "");

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
