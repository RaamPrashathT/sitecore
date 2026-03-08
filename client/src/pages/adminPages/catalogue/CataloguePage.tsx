import CatalogueTable from "@/components/catalogue/CatalogueTable"
import { useMembership } from "@/hooks/useMembership";

const CataloguePage = () => {
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
            <CatalogueTable orgId={membership.id}/>
        </div>
    )
}

export default CataloguePage