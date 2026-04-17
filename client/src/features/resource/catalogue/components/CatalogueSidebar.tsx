import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Search, Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/useDebounce";
import { useGetCatalogueMaster } from "../hooks/useGetCatalogueMaster";
import { cn } from "@/lib/utils";

const CatalogueListSidebar = () => {
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 400);

    const { orgSlug, catalogueId } = useParams<{
        orgSlug: string;
        catalogueId: string;
    }>();
    const navigate = useNavigate();

    const { data, isLoading, isError } = useGetCatalogueMaster(debouncedSearch);
    const list = data?.data ?? [];

    return (
        <div className="flex h-full flex-col">
            {/* Header */}
            <div className="px-4 pt-5 pb-4 border-b border-border">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                    Master Catalogue
                </p>
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search items…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-8 pl-8 pr-3 text-sm bg-muted/50 border border-border rounded-md placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:bg-background transition-colors"
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto py-2">
                {isLoading && <CatalogueSidebarSkeleton />}

                {!isLoading && isError && (
                    <p className="px-4 py-3 text-xs text-destructive">
                        Failed to load catalogue.
                    </p>
                )}

                {!isLoading && !isError && list.length === 0 && (
                    <div className="flex flex-col items-center gap-2 py-12 px-4 text-center">
                        <Package className="h-8 w-8 text-muted-foreground/40" />
                        <p className="text-xs text-muted-foreground">
                            {search ? "No items match your search." : "No catalogue items yet."}
                        </p>
                    </div>
                )}

                {!isLoading &&
                    !isError &&
                    list.map((item) => {
                        const isActive = item.id === catalogueId;
                        return (
                            <button
                                key={item.id}
                                onClick={() =>
                                    navigate(`/${orgSlug}/catalogue/${item.id}`)
                                }
                                className={cn(
                                    "w-full text-left px-4 py-2.5 text-sm transition-colors",
                                    isActive
                                        ? "bg-primary/8 text-primary font-semibold"
                                        : "text-foreground/70 hover:bg-muted/60 hover:text-foreground"
                                )}
                            >
                                {item.name}
                            </button>
                        );
                    })}
            </div>

            {/* Footer count */}
            {!isLoading && !isError && list.length > 0 && (
                <div className="px-4 py-3 border-t border-border">
                    <p className="text-[10px] text-muted-foreground">
                        {list.length} item{list.length === 1 ? "" : "s"}
                    </p>
                </div>
            )}
        </div>
    );
};

const SKELETON_KEYS = ["a", "b", "c", "d", "e", "f", "g"];

const CatalogueSidebarSkeleton = () => (
    <div className="px-4 py-2 space-y-1">
        {SKELETON_KEYS.map((k) => (
            <Skeleton key={k} className="h-8 w-full rounded-md" />
        ))}
    </div>
);

export default CatalogueListSidebar;
