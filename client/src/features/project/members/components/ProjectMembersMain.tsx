import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useProjectMembers } from "../hooks/useProjectMembers"; 
import MembersFilterBar from "./ProjectMembersFilter";
import MembersList from "./ProjectsMembersList";

export type FilterType = "ALL" | "CLIENT" | "ENGINEER" | "ADMIN";

export interface UIMember {
    userId: string;
    name: string;
    role: string;
    phone: string;
    email: string;
    profileImage: string | null;
    type: "CLIENT" | "ENGINEER" | "ADMIN";
}

export const ProjectMembersMain = () => {
    const { orgSlug, projectSlug } = useParams<{ orgSlug: string; projectSlug: string }>();
    const { data, isLoading, isError } = useProjectMembers(orgSlug, projectSlug);

    const [activeFilter, setActiveFilter] = useState<FilterType>("ALL");
    const [searchQuery, setSearchQuery] = useState("");

    const allMembers = useMemo<UIMember[]>(() => {
        if (!data) return [];
        const admins = data.admin.members.map((m) => ({ ...m, type: "ADMIN" as const }));
        const engineers = data.engineers.members.map((m) => ({ ...m, type: "ENGINEER" as const }));
        const clients = data.clients.members.map((m) => ({ ...m, type: "CLIENT" as const }));
        
        return [...admins, ...engineers, ...clients];
    }, [data]);

    const counts = useMemo(() => {
        if (!data) return { ALL: 0, CLIENT: 0, ENGINEER: 0, ADMIN: 0 };
        return {
            ALL: data.admin.count + data.engineers.count + data.clients.count,
            CLIENT: data.clients.count,
            ENGINEER: data.engineers.count,
            ADMIN: data.admin.count,
        };
    }, [data]);

    const filteredMembers = useMemo(() => {
        return allMembers.filter((m) => {
            const matchesFilter = activeFilter === "ALL" || m.type === activeFilter;
            const q = searchQuery.toLowerCase();
            const matchesSearch =
                !q ||
                m.name.toLowerCase().includes(q) ||
                m.role.toLowerCase().includes(q) ||
                m.email.toLowerCase().includes(q);
            return matchesFilter && matchesSearch;
        });
    }, [allMembers, activeFilter, searchQuery]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-green-700" />
            </div>
        );
    }

    if (isError) {
        return <div className="text-red-500 py-8 text-center">Failed to load project members.</div>;
    }

    return (
        <div className="w-full p-6">
            <div className="bg-white overflow-hidden flex flex-col">
                <MembersFilterBar
                    activeFilter={activeFilter}
                    setActiveFilter={setActiveFilter}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    counts={counts}
                />
                <MembersList members={filteredMembers} activeFilter={activeFilter} />
            </div>
        </div>
    );
}