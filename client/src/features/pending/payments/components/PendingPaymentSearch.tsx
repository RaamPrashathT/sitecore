import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { PendingPhaseListType } from "../hooks/usePendingPhaseList";
import type { Table as ReactTableType } from "@tanstack/react-table";
interface PendingPaymentSearchProps {
    table: ReactTableType<PendingPhaseListType>;
}

const PendingPaymentSearch = ({ table }: PendingPaymentSearchProps) => {
    return (
        <div className="relative w-full max-w-[280px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                placeholder="Search payments..."
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

export default PendingPaymentSearch;
