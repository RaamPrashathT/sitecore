import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetSupplierQuotesByCatalogue } from "../../hooks/useSupplierQuotes";
import { CatalogueQuotesTable } from "./CatalogueQuotesTable";

export default function CatalogueQuotesMain() {
    const [search, setSearch] = useState("");
    const navigate = useNavigate();

    const { data, isLoading } = useGetSupplierQuotesByCatalogue();
    const quotes = data?.data ?? [];

    if (isLoading) return <LoadingSkeleton />;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Filter suppliers..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        className="h-8 pl-8 text-sm"
                    />
                </div>

                <Button
                    size="sm"
                    className="h-8 gap-1.5"
                    onClick={() => navigate("new")}
                >
                    <Plus className="size-3.5" data-icon="inline-start" />
                    Add Quote
                </Button>
            </div>

            <CatalogueQuotesTable data={quotes} globalFilter={search} />
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-72" />
                <Skeleton className="h-8 w-28" />
            </div>
            <div className="overflow-hidden rounded-lg border border-border">
                <div className="border-b border-border bg-muted/40 px-4 py-2.5">
                    <Skeleton className="h-3 w-full" />
                </div>
                {[1, 2, 3].map((row) => (
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
