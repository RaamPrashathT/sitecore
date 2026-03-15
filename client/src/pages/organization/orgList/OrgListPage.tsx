import OrgList from "@/features/organizationList/components/OrgList"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Link } from "react-router-dom"

const OrganizationListPage = () => {
    return (
        <div className="max-w-2xl mx-auto px-6 py-12">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-xl font-semibold tracking-tight text-gray-900">Organizations</h1>
                <Button size="sm" >
                    <Link to="/organizations/create" className="flex items-center gap-x-1" >
                        <Plus/>
                        <p className="mb-px">New</p>
                    </Link>
                </Button>
            </div>
            <OrgList />
        </div>
    )
}

export default OrganizationListPage