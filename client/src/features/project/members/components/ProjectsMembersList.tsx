import type { UIMember, FilterType } from "./ProjectMembersMain";
import { UserAvatar } from "@/components/Avatar";

interface MembersListProps {
    readonly members: UIMember[];
    readonly activeFilter: FilterType;
}

const groupLabels = {
    ADMIN: "Administrators",
    ENGINEER: "Engineers",
    CLIENT: "Clients",
};

export default function MembersList({ members, activeFilter }: MembersListProps) {
    if (members.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-sm font-medium text-[#2b3437]">No members found</p>
                <p className="text-sm text-[#737c7f] mt-1">Try adjusting your search or filter criteria.</p>
            </div>
        );
    }

    const groupsToRender =
        activeFilter === "ALL"
            ? (["ADMIN", "ENGINEER", "CLIENT"] as const)
            : [activeFilter];

    return (
        <div className="space-y-4">
            {groupsToRender.map((type) => {
                const groupMembers = members.filter((m) => m.type === type);
                if (groupMembers.length === 0) return null;

                return (
                    <section key={type}>
                        <div className="flex items-center gap-4">
                            <h2 className="font-display font-medium tracking-wide text-[#2b3437]/60 uppercase text-xs">
                                {groupLabels[type as keyof typeof groupLabels]}
                            </h2>
                            <div className="h-[1px] flex-grow bg-[#abb3b7]/20"></div>
                        </div>

                        <div className="space-y-4">
                            {groupMembers.map((m) => (
                                <MemberListItem key={m.userId} member={m} />
                            ))}
                        </div>
                    </section>
                );
            })}
        </div>
    );
}

function MemberListItem({ member }: { readonly member: UIMember }) {
    return (
        <div className="group flex flex-col md:flex-row items-center gap-6 py-4 ">
            <div className="shrink-0 relative">
                <UserAvatar name={member.name} image={member.profileImage} />
            </div>

            <div className="grow grid grid-cols-1 md:grid-cols-3 gap-3 items-center w-full">
                <div className="col-span-1">
                    <h3 className="font-semibold text-[#2b3437] text-lg">{member.name}</h3>
                </div>
                <div className="col-span-1">
                    {member.email ? (
                        <a href={`mailto:${member.email}`} className="text-sm text-[#737c7f] lowercase hover:text-[#006d30] transition-colors">
                            {member.email}
                        </a>
                    ) : (
                        <span className="text-sm text-[#737c7f]/50 italic">No email provided</span>
                    )}
                </div>
                <div className="col-span-1 text-right md:text-left">
                    {member.phone ? (
                        <a href={`tel:${member.phone}`} className="text-sm font-mono text-[#2b3437] tracking-tighter hover:text-[#006d30] transition-colors">
                            {member.phone}
                        </a>
                    ) : (
                        <span className="text-sm text-[#737c7f]/50 italic">No phone provided</span>
                    )}
                </div>
            </div>
        </div>
    );
}