import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetSupplierQuotesByCatalogue } from "../../hooks/useSupplierQuotes";
import { CatalogueQuotesTable } from "./CatalogueQuotesTable";

export default function CatalogueQuotesMain() {
    const [search, setSearch] = useState("");
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    const { data, isLoading } = useGetSupplierQuotesByCatalogue();
    const quotes = data?.data ?? [];

    if (isLoading) return <LoadingSkeleton />;

    return (
        <div className="space-y-4">
            {/* Controls */}
            <div className="flex items-center justify-between gap-4">
                <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <Input
                        placeholder="Filter suppliers..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8 h-8 text-sm"
                    />
                </div>

                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="h-8 gap-1.5">
                            <Plus className="size-3.5" data-icon="inline-start" />
                            Add Quote
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Supplier Quote</DialogTitle>
                        </DialogHeader>
                        <p className="text-sm text-muted-foreground">
                            Quote creation form — coming soon.
                        </p>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Table */}
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
            <div className="rounded-lg border border-border overflow-hidden">
                <div className="bg-muted/40 border-b border-border px-4 py-2.5">
                    <Skeleton className="h-3 w-full" />
                </div>
                {[1, 2, 3].map((i) => (
                    <div key={i} className="px-4 py-4 border-b border-border last:border-0">
                        <Skeleton className="h-5 w-full" />
                    </div>
                ))}
            </div>
        </div>
    );
}
