import CreateCatalogueForm from "@/components/catalogue/CreateCatalogueForm"
import { useOrg } from "@/hooks/useOrg";

const CreateCataloguePage = () => {
    const {membership, isLoading} = useOrg();

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
            <CreateCatalogueForm orgId={membership.orgId} orgName={membership.orgName}/>
        </div>
    )
}

export default CreateCataloguePage