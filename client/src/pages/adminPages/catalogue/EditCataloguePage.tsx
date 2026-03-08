import EditCatalogueForm from "@/components/catalogue/EditCatalogueForm"
import { useMembership } from "@/hooks/useMembership";

import { useParams } from "react-router-dom";

const EditCataloguePage = () => {
    const {data: membership, isLoading} = useMembership();
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
            <EditCatalogueForm orgId={membership.id} orgName={membership.slug} catalogueId={params.catalogueId} quoteId={params.quoteId}/>
        </div>
    )
}

export default EditCataloguePage