import { useEffect, useState } from "react";
import OrgListItem from "./OrgListItem";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

type OrgType = {
    id: string;
    name: string;
    role: string;
};

type IncomingDataType = {
    organizationId: string;
    role: string;
    organization: {
        orgName: string;
    };
};

const OrgList = () => {
    const [orgs, setOrgs] = useState<OrgType[]>([]);
    const [orgName, setOrgName] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrgs = async () => {
            try {
                const result = await api.get("/org/getOrgs");
                const refactoredResult = result.data.map(
                    (org: IncomingDataType) => {
                        return {
                            id: org.organizationId,
                            name: org.organization.orgName,
                            role: org.role,
                        };
                    },
                );
                setOrgs(refactoredResult);
            } catch (error) {
                console.log(error);
            }
        };
        fetchOrgs();
    }, []);

    const handleOrgCreate = async () => {
        if (!orgName.trim()) {
            setError("Please enter an organization name");
            return;
        }
        try {
            const result = await api.post("/org/create", {
                orgName: orgName,
            });
            if (!result.data.success) {
                setError(result.data.message || "Something went wrong");
                return;
            }

            setOrgName("");
            setError(null);
        } catch (error: any) {
            setError(error?.response?.data?.message || "Something went wrong");
        }
    };

    return (
        <div>
            <div>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleOrgCreate();
                    }}
                    className="flex gap-x-1 w-2xl"
                >
                    <Input
                        type="text"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                    />
                    <Button type="submit" className="flex justify-center gap-x-1">
                        <Plus strokeWidth={3} className="p-0" />
                        <p>Create Organization</p>
                    </Button>
                </form>
            </div>
            {error && <p className="text-destructive">{error}</p>}
            <div className="mt-4">
                <h1 className="text-xl font-bold">Your Organizations List:</h1>
                <ul>
                    {orgs.length > 0 ? (
                        orgs.map((org) => (
                            <OrgListItem
                                key={org.id}
                                id={org.id}
                                organizationName={org.name}
                                role={org.role}
                            />
                        ))
                    ) : (
                        <p>No organizations found.</p>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default OrgList;
