import { useMembership } from "@/hooks/useMembership";
import { Navigate, Outlet } from "react-router-dom";

const OrgGuard = () => {
    const { data: membership, isLoading } = useMembership();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!membership) {
        return <Navigate to="/login" />;
    }

    return <Outlet />;
}

export default OrgGuard;