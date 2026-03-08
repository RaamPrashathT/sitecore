import CreateCatalogueForm from "@/components/catalogue/CreateCatalogueForm"
import { useMembership } from "@/hooks/useMembership";

const CreateCataloguePage = () => {
    const {data: membership, isLoading} = useMembership();

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
            <CreateCatalogueForm orgId={membership.id} slug={membership.slug}/>
        </div>
    )
}

export default CreateCataloguePage