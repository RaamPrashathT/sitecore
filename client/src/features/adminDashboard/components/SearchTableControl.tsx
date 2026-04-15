import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { DashboardItemType } from "../hooks/useGetDashboardItems";
import type { Table as ReactTableType } from "@tanstack/react-table";

interface SearchTableControlProps {
    table: ReactTableType<DashboardItemType>;
}

const SearchTableControl = ({ table }: SearchTableControlProps) => {
    const value = (table.getState().globalFilter as string) ?? "";

    return (
        <div className="relative w-full sm:w-[280px]">
            <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <Input
                placeholder="Search materials or projects..."
                value={value}
                className="rounded-full pl-9 h-9 text-sm bg-slate-50 border-slate-200 focus-visible:bg-white focus-visible:ring-slate-300/50 placeholder:text-slate-400 transition-all duration-150"
                onChange={(e) => table.setGlobalFilter(String(e.target.value))}
            />
            {value && (
                <button
                    onClick={() => table.setGlobalFilter("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors text-xs font-medium"
                    aria-label="Clear search"
                >
                    ✕
                </button>
            )}
        </div>
    );
};

export default SearchTableControl;
