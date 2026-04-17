import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useGetCatalogueItem } from "../hooks/useGetCatalogueItem";

const TABS = [
    { value: "overview", label: "Overview" },
    { value: "quotes", label: "Quotes" },
    { value: "locations", label: "Locations" },
    { value: "transactions", label: "Transactions" },
] as const;

const CATEGORY_COLORS: Record<string, string> = {
    MATERIALS: "bg-amber-50 text-amber-700 border-amber-200",
    LABOUR: "bg-blue-50 text-blue-700 border-blue-200",
    EQUIPMENT: "bg-violet-50 text-violet-700 border-violet-200",
    SUBCONTRACTORS: "bg-rose-50 text-rose-700 border-rose-200",
    TRANSPORT: "bg-cyan-50 text-cyan-700 border-cyan-200",
    OVERHEAD: "bg-stone-50 text-stone-600 border-stone-200",
};

const CatalogueDetailLayout = () => {
    const { catalogueId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const { data, isLoading } = useGetCatalogueItem();
    const item = data?.data;

    const pathSegments = location.pathname.split("/");
    const lastSegment = pathSegments.at(-1);
    const currentTab = lastSegment === catalogueId ? "overview" : lastSegment;

    const handleTabChange = (value: string) => {
        navigate(value === "overview" ? "" : value);
    };

    return (
        <div className="flex h-full flex-col">
            {/* Page header */}
            <div className="bg-background border-b border-border px-8 pt-7 pb-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="space-y-1.5">
                        {isLoading ? (
                            <>
                                <Skeleton className="h-7 w-56" />
                                <Skeleton className="h-4 w-32" />
                            </>
                        ) : (
                            <>
                                <h1 className="text-xl font-semibold tracking-tight text-foreground leading-none">
                                    {item?.name}
                                </h1>
                                <div className="flex items-center gap-2">
                                    {item?.category && (
                                        <span
                                            className={cn(
                                                "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide border",
                                                CATEGORY_COLORS[item.category] ??
                                                    "bg-muted text-muted-foreground border-border",
                                            )}
                                        >
                                            {item.category}
                                        </span>
                                    )}
                                    {item?.unit && (
                                        <span className="text-xs text-muted-foreground font-mono">
                                            {item.unit}
                                        </span>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Tab bar */}
                <nav className="flex gap-0 -mb-px">
                    {TABS.map((tab) => {
                        const isActive = currentTab === tab.value;
                        return (
                            <button
                                key={tab.value}
                                onClick={() => handleTabChange(tab.value)}
                                className={cn(
                                    "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                                    isActive
                                        ? "border-primary text-primary"
                                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
                                )}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
                <Outlet />
            </div>
        </div>
    );
};

export default CatalogueDetailLayout;
