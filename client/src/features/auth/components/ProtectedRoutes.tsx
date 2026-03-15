import { useSession } from "@/features/auth/hooks/useSession";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoutes = () => {
    const { isLoading, isError, user } = useSession();
    if (isLoading) return <div></div>;

    if (isError || !user) return <Navigate to="/login" />;
    return <Outlet />;
};

export default PrivateRoutes;