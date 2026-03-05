import api from "@/lib/axios";
import { createContext, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

interface MembershipType {
    orgId: string;
    orgName: string;
    role: "ADMIN" | "ENGINEER" | "CLIENT";
}

interface OrgContextType {
    membership: MembershipType | null;
    isLoading: boolean;
}

const OrgContext = createContext<OrgContextType | undefined>(undefined);

export const OrgProvider = ({
    children,
}: {
    readonly children: React.ReactNode;
}) => {
    const [membership, setMembership] = useState<MembershipType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { orgSlug } = useParams();

    useEffect(() => {
        const fetchMembership = async () => {
            if (!orgSlug) {
                setIsLoading(false); 
                return;
            }
            setIsLoading(true);
            try {
                const response = await api.post("/org/identity", {
                    orgName: orgSlug,
                });
                setMembership(response.data.data);
            } catch (error) {
                console.log(error);
                setMembership(null);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMembership();
    }, [orgSlug]);

    const value = useMemo(
        () => ({ membership, isLoading }),
        [membership, isLoading],
    );

    return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>;
};

export default OrgContext;
