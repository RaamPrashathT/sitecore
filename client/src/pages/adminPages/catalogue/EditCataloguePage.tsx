import EditCatalogueForm from "@/components/catalogue/EditCatalogueForm"
import { useOrg } from "@/hooks/useOrg";
import { useParams } from "react-router-dom";

const EditCataloguePage = () => {
    const {membership, isLoading} = useOrg();
    const params = useParams();

    if(!params.catalogueId || !params.quoteId) return (
        <div>
            No access
        </div>
    )

    if(isLoading) return (
        <div>
            Loading...
        </div>
    )
    if(!membership) return (
        <div>
            No access
        </div>
    )
    return (
        <div>
            <EditCatalogueForm orgId={membership.orgId} orgName={membership.orgName} catalogueId={params.catalogueId} quoteId={params.quoteId}/>
        </div>
    )
}

export default EditCataloguePage