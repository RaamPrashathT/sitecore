import { useParams, Navigate } from "react-router-dom";
import CatalogueDashboard from "@/features/catalogue/components/CatalogueDashboard";

const CatalogueDashboardPage = () => {
    const { catalogueId } = useParams();

    if (!catalogueId) return <Navigate to=".." replace />;

    return (
        <div className="h-full">
            <CatalogueDashboard catalogueId={catalogueId} />
        </div>
    );
};

export default CatalogueDashboardPage;
