import CatalogueTable from "@/components/catalogue/CatalogueTable"
import { useOrg } from "@/hooks/useOrg"

const CataloguePage = () => {
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
            <CatalogueTable orgId={membership.orgId}/>
        </div>
    )
}

export default CataloguePage