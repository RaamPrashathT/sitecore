import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { Table as ReactTableType } from "@tanstack/react-table";
import type { ClientType } from "@/hooks/useClients";
interface ClientSearchProps {
    table: ReactTableType<ClientType>;
}

const ClientSearch = ({ table }: ClientSearchProps) => {
    return (
        <div className="relative w-full max-w-[280px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-700/80" />
            <Input
                placeholder="Search for items..."
                value={(table.getState().globalFilter as string) ?? ""}
                className="h-10 rounded-lg border-border bg-background pl-9 font-sans text-sm placeholder:font-sans focus-visible:ring-1 focus-visible:ring-green-700"
                onChange={(e) => {
                    const value = String(e.target.value);
                    table.setGlobalFilter(value);
                    table.setPageIndex(0); 
                }}
            />
        </div>
    );
};

export default ClientSearch;
