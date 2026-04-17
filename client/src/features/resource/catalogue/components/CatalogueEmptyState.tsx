import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Package } from "lucide-react";
import { useGetCatalogueMaster } from "../hooks/useGetCatalogueMaster";

const CatalogueEmptyState = () => {
    const { orgSlug } = useParams<{ orgSlug: string }>();
    const navigate = useNavigate();

    const { data, isLoading } = useGetCatalogueMaster("");

    useEffect(() => {
        const firstId = data?.data?.[0]?.id;
        if (firstId) {
            navigate(`/${orgSlug}/catalogue/${firstId}`, { replace: true });
        }
    }, [data, orgSlug, navigate]);

    if (isLoading || data?.data?.[0]) return null;

    return (
        <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                    <Package className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                        No catalogue items
                    </p>
                    <p className="text-xs text-muted-foreground max-w-[200px]">
                        Add items to your master catalogue to get started.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CatalogueEmptyState;
