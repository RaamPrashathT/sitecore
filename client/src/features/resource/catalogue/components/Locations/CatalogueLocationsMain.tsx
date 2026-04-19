import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetCatalogueItem } from "../../hooks/useGetCatalogueItem";
import { useCatalogueInventoryLocations } from "../../hooks/useCatalogueInventoryLocations";
import { CatalogueLocationsTable } from "./CatalogueLocationsTable";

const CatalogueLocationsMain = () => {
    const [search, setSearch] = useState("");
    const { data: catalogueData } = useGetCatalogueItem();
    const { data, isLoading } = useCatalogueInventoryLocations();

    const locations = useMemo(() => data?.data ?? [], [data?.data]);
    const totalQuantity = useMemo(
        () => locations.reduce((sum, location) => sum + location.quantityStored, 0),
        [locations],
    );
    const unit = catalogueData?.data.unit;

    if (isLoading) return <CatalogueLocationsSkeleton />;

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                        {data?.count ?? 0} {(data?.count ?? 0) === 1 ? "location" : "locations"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Total stored:{" "}
                        <span className="font-mono font-semibold text-foreground">
                            {totalQuantity.toLocaleString("en-IN")}
                            {unit ? ` ${unit}` : ""}
                        </span>
                    </p>
                </div>

                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Filter locations..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        className="h-8 pl-8 text-sm"
                    />
                </div>
            </div>

            <CatalogueLocationsTable data={locations} globalFilter={search} />
        </div>
    );
};

function CatalogueLocationsSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-36" />
                </div>
                <Skeleton className="h-8 w-full sm:w-72" />
            </div>
            <div className="rounded-lg border border-border overflow-hidden">
                <div className="bg-muted/40 border-b border-border px-4 py-3">
                    <Skeleton className="h-3 w-full" />
                </div>
                {[1, 2, 3, 4].map((row) => (
                    <div
                        key={row}
                        className="border-b border-border px-4 py-4 last:border-0"
                    >
                        <Skeleton className="h-5 w-full" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default CatalogueLocationsMain;
