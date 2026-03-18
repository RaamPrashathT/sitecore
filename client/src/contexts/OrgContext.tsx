import { useMembership, type MembershipType,   } from "@/hooks/useMembership";
import { createContext, useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";

const OrgContext = createContext<MembershipType | null>(null);

export const useOrg = () => useContext(OrgContext);

const OrgGuard = () => {
    const { data: membership, isLoading } = useMembership();

    if (isLoading) return <div>Loading...</div>;
    if (!membership) return <Navigate to="/login" />;

    return (
        <OrgContext.Provider value={membership}>
            <Outlet />
        </OrgContext.Provider>
    );
};

export default OrgGuard;