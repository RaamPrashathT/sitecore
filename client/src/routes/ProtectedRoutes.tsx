import { useAuth } from "@/hooks/useAuth";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoutes = () => {
    const {user, isLoading} = useAuth();

    if(isLoading) return (
        <div>
            Loading...
        </div>
    )

    return user ? <Outlet/> : <Navigate to="/login" />
}

export default PrivateRoutes;