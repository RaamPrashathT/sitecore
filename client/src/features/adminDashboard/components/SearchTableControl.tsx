import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { DashboardItemType } from "../hooks/useGetDashboardItems";
import type { Table as ReactTableType } from "@tanstack/react-table";

interface SearchTableControlProps {
    table: ReactTableType<DashboardItemType>;
}

const SearchTableControl = ({ table }: SearchTableControlProps) => {
    return (
        <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                placeholder="Search materials or projects..."
                value={(table.getState().globalFilter as string) ?? ""}
                className="rounded-full pl-9 bg-surface-container-lowest"
                onChange={(e) => {
                    table.setGlobalFilter(String(e.target.value));
                }}
            />
        </div>
    );
};

export default SearchTableControl;