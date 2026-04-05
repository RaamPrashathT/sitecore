import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, UserPlus } from "lucide-react";
import { useProjectMembers } from "../hooks/useProjectMembers"; 
import MembersFilterBar from "./ProjectMembersFilter";
import MembersList from "./ProjectsMembersList";
import { Button } from "@/components/ui/button";

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
    const navigate = useNavigate();
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
                <Loader2 className="h-8 w-8 animate-spin text-[#006d30]" />
            </div>
        );
    }

    if (isError) {
        return <div className="text-red-500 py-8 text-center">Failed to load project members.</div>;
    }

    return (
        <div className="bg-[#f8f9fa] min-h-screen font-sans text-[#2b3437]">
            <div className="pt-8 pb-8 px-6 md:px-12 max-w-6xl mx-auto">
                <header className="mb-16">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="font-serif text-4xl md:text-4xl font-light text-[#2b3437] tracking-tight">
                                Members
                            </h1>
                        </div>
                        <div className="flex flex-col items-end gap-4">
                            <Button 
                                onClick={() => navigate("invite")}
                            >
                                <UserPlus className="h-4 w-4" />
                                Invite New Member
                            </Button>
                        </div>
                    </div>
                </header>

                <div className="flex flex-col">
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
        </div>
    );
}