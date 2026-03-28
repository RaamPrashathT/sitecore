import { Mail, Phone } from "lucide-react";
import type { UIMember, FilterType } from "./ProjectMembersMain";
import { UserAvatar } from "@/components/Avatar";

interface MembersListProps {
    readonly members: UIMember[];
    readonly activeFilter: FilterType;
}


const groupLabels = {
    CLIENT: "Clients",
    ENGINEER: "Engineers",
    ADMIN: "Admins",
};


export default function MembersList({ members, activeFilter }: MembersListProps) {
    if (members.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-sm font-medium text-gray-900">No members found</p>
                <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filter criteria.</p>
            </div>
        );
    }

    const groupsToRender =
        activeFilter === "ALL"
            ? (["CLIENT", "ENGINEER", "ADMIN"] as const)
            : [activeFilter];

    return (
        <div className="flex flex-col">
            {groupsToRender.map((type) => {
                const groupMembers = members.filter((m) => m.type === type);
                if (groupMembers.length === 0) return null;

                return (
                    <div key={type} className="flex flex-col">
                        {activeFilter === "ALL" && (
                            <div className="bg-gray-50 px-6 py-2 rounded-lg">
                                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                                    {groupLabels[type as keyof typeof groupLabels]}
                                </h3>
                            </div>
                        )}

                        <div className="divide-y divide-gray-100">
                            {groupMembers.map((m) => (
                                <MemberListItem key={m.userId} member={m} />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function MemberListItem({ member }: { readonly member: UIMember }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors">
            
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <UserAvatar name={member.name} image={member.profileImage} />
                <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-gray-900 truncate">
                        {member.name}
                    </span>
                    <span className="text-xs text-gray-500 truncate mt-0.5 capitalize">
                        {member.role.toLowerCase() || "Member"}
                    </span>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-8 flex-1 min-w-0">
                {member.email ? (
                    <a
                        href={`mailto:${member.email}`}
                        className="flex items-center gap-2 text-[13px] text-gray-600 hover:text-green-700 truncate group flex-1"
                    >
                        <Mail className="h-3.5 w-3.5 text-gray-400 group-hover:text-green-700 shrink-0" />
                        <span className="truncate">{member.email}</span>
                    </a>
                ) : (
                    <span className="flex items-center gap-2 text-[13px] text-gray-400 italic flex-1">
                        <Mail className="h-3.5 w-3.5 opacity-40 shrink-0" />
                        No email provided
                    </span>
                )}

                {member.phone ? (
                    <a
                        href={`tel:${member.phone}`}
                        className="flex items-center gap-2 text-[13px] text-gray-600 hover:text-green-700 truncate group w-32 shrink-0"
                    >
                        <Phone className="h-3.5 w-3.5 text-gray-400 group-hover:text-green-700 shrink-0" />
                        <span className="truncate">{member.phone}</span>
                    </a>
                ) : (
                    <span className="flex items-center gap-2 text-[13px] text-gray-400 italic w-32 shrink-0">
                        <Phone className="h-3.5 w-3.5 opacity-40 shrink-0" />
                        No phone number provided
                    </span>
                )}
            </div>

            
        </div>
    );
}