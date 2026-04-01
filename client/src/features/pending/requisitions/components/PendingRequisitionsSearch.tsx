import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { PendingRequisitionData } from "../hooks/usePendingRequisition";
import type { Table as ReactTableType } from "@tanstack/react-table";
interface PendingRequisitionSearchProps {
    table: ReactTableType<PendingRequisitionData>;
}

const PendingRequisitionSearch = ({ table }: PendingRequisitionSearchProps) => {
    return (
        <div className="relative w-full max-w-[280px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                placeholder="Search requisitions..."
                value={(table.getState().globalFilter as string) ?? ""}
                className="rounded-lg pl-9 font-sans text-sm border-border/70 focus-visible:ring-green-700"
                onChange={(e) => {
                    const value = String(e.target.value);
                    table.setGlobalFilter(value);
                    table.setPageIndex(0); 
                }}
            />
        </div>
    );
};

export default PendingRequisitionSearch;
