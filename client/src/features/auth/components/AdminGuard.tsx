import { useSession } from "@/features/auth/hooks/useSession";
import { useMembership } from "@/hooks/useMembership";
import { Navigate, Outlet } from "react-router-dom";

const AdminGuard = () => {
    const { isLoading: sessionLoading, user } = useSession();
    const { data: membership, isLoading: membershipLoading } = useMembership();

    if (sessionLoading || membershipLoading) return null;

    if (!user) return <Navigate to="/login" />;
    if (!membership) return <Navigate to="/login" />;

    if (membership.role !== "ADMIN") return <Navigate to="/organizations" />;

    return <Outlet />;
};

export default AdminGuard;