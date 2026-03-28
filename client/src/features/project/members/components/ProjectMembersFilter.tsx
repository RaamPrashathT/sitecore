import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { FilterType } from "./ProjectMembersMain";
import { Button } from "@/components/ui/button";

interface FilterBarProps {
    readonly activeFilter: FilterType;
    readonly setActiveFilter: (filter: FilterType) => void;
    readonly searchQuery: string;
    readonly setSearchQuery: (query: string) => void;
    readonly counts: Record<FilterType, number>;
}

const filters: { id: FilterType; label: string }[] = [
    { id: "ALL", label: "All" },
    { id: "CLIENT", label: "Clients" },
    { id: "ENGINEER", label: "Engineers" },
    { id: "ADMIN", label: "Admins" },
];

export default function MembersFilterBar({
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    counts,
}: FilterBarProps) {
    return (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4">
            <div className="flex flex-wrap gap-1  p-1 rounded-lg">
                {filters.map((f) => {
                    const isActive = activeFilter === f.id;
                    return (
                        <button
                            key={f.id}
                            onClick={() => setActiveFilter(f.id)}
                            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                                isActive
                                    ? "bg-white text-green-700 shadow-sm ring-1 ring-gray-200"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/80"
                            }`}
                        >
                            {f.label}
                            <span
                                className={`text-[11px] px-1.5 py-0.5 rounded-md ${
                                    isActive
                                        ? "bg-green-50 text-green-700"
                                        : "bg-gray-100 text-gray-500"
                                }`}
                            >
                                {counts[f.id]}
                            </span>
                        </button>
                    );
                })}
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto">
                <div className="relative flex-1 lg:w-72 shrink-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search members..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9 w-full text-sm  bg-white"
                    />
                </div>
                <Button className="h-9 bg-green-700 hover:bg-green-800 text-white px-6">
                    Invite
                </Button>
            </div>
        </div>
    );
}