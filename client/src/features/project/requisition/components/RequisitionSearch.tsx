import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { CatalogueWithQuotes } from "@/features/project/requisition/hooks/useGetRequisitionCatalogue";
import type { Table as ReactTableType } from "@tanstack/react-table";

interface RequisitionSearchProps {
    table: ReactTableType<CatalogueWithQuotes>;
}

const RequisitionSearch = ({ table }: RequisitionSearchProps) => {
    return (
        <div className="relative w-[250px]">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                placeholder="Search for items..."
                value={(table.getState().globalFilter as string) ?? ""}
                className="rounded-full pl-7"
                onChange={(e) => {
                    const value = String(e.target.value);
                    table.setGlobalFilter(value);
                    table.setPageIndex(0);
                }}
            />
        </div>
    );
};

export default RequisitionSearch;