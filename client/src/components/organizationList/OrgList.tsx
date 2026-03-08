import api from "@/lib/axios";
import { useEffect, useState } from "react";
import OrgListItem from "./OrgListItem";

interface FetchOrgType {
    role: string;
    organizationId: string;
    organization: {
        orgName: string;
    };
}

const OrgList = () => {
    const [orgList, setOrgList] = useState<FetchOrgType[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrganizations = async () => {
            setError(null);
            try {
                const result = await api.get<FetchOrgType[]>("/org");
                setOrgList(result.data);
            } catch (error) {
                if (error instanceof Error) {
                    setError(error.message);
                }
            }
        };

        fetchOrganizations();
    }, []);

    if (error) {
        return <p className="text-sm text-red-500">{error}</p>;
    }

    if (orgList.length === 0) {
        return <p className="text-sm text-gray-400">No organizations found.</p>;
    }

    return (
        <ul className="divide-y divide-gray-100 rounded-lg border border-gray-100 overflow-hidden">
            {orgList.map((org, index) => (
                <OrgListItem
                    key={org.organizationId}
                    role={org.role}
                    orgName={org.organization.orgName}
                    index={index}
                />
            ))}
        </ul>
    );
};

export default OrgList;