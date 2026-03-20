import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { DashboardItemType } from "../hooks/useGetDashboardItems";
import type { Table as ReactTableType } from "@tanstack/react-table";
interface AdminDashboardPaginationProps {
    table: ReactTableType<DashboardItemType>;
}

const SearchTableControl = ({ table }: AdminDashboardPaginationProps) => {
    return (
        <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search for items..." className="rounded-full pl-7"  onChange={e => table.setGlobalFilter(String(e.target.value))} />
        </div>
    );
};

export default SearchTableControl;
