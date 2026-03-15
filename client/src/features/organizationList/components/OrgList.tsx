import OrgListItem from "./OrgListItem";
import { useOrganizations } from "@/features/organizationList/hooks/useOrganization";

const OrgList = () => {
    const { data: organizations, isLoading, error } = useOrganizations()
    
    if (isLoading) {
        return <p className="text-sm text-gray-400">Loading...</p>;
    }

    if (error instanceof Error) {
        return <p className="text-sm text-red-500">{error.message}</p>;
    }

    if (!organizations || organizations.length === 0) {
        return <p className="text-sm text-gray-400">No organizations found.</p>;
    }

    return (
        <ul className="divide-y divide-gray-100 rounded-lg border border-gray-100 overflow-hidden">
            {organizations.map((org, index) => (
                <OrgListItem
                    key={org.id}
                    role={org.role}
                    name={org.name}
                    slug={org.slug}
                    index={index}
                />
            ))}
        </ul>
    );
};

export default OrgList;