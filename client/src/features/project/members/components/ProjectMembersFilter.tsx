import { Search } from "lucide-react";
import type { FilterType } from "./ProjectMembersMain";

interface FilterBarProps {
    readonly activeFilter: FilterType;
    readonly setActiveFilter: (filter: FilterType) => void;
    readonly searchQuery: string;
    readonly setSearchQuery: (query: string) => void;
    readonly counts: Record<FilterType, number>;
}

const filters: { id: FilterType; label: string }[] = [
    { id: "ALL", label: "All Members" },
    { id: "CLIENT", label: "Clients" },
    { id: "ENGINEER", label: "Engineers" },
    { id: "ADMIN", label: "Admins" },
];

export default function MembersFilterBar({
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
}: FilterBarProps) {
    return (
        <section className="mb-8 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-8 overflow-x-auto w-full md:w-auto no-scrollbar">
                {filters.map((f) => {
                    const isActive = activeFilter === f.id;
                    return (
                        <button
                            key={f.id}
                            onClick={() => setActiveFilter(f.id)}
                            className={`pb-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
                                isActive
                                    ? "text-[#006d30] font-bold border-b-2 border-[#006d30]"
                                    : "text-[#737c7f] hover:text-[#2b3437]"
                            }`}
                        >
                            {f.label}
                        </button>
                    );
                })}
            </div>

            <div className="relative w-full md:w-80">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-[#737c7f] h-5 w-5" />
                <input
                    placeholder="Search members by name or role..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-0 border-b border-[#abb3b7]/40 focus:border-[#006d30] focus:ring-0 pl-8 pb-2 text-sm placeholder:text-[#abb3b7] transition-all outline-none"
                />
            </div>
        </section>
    );
}