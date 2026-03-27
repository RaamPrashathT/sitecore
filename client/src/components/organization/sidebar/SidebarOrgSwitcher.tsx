import { ChevronsUpDown, Plus } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { useMembership } from "@/hooks/useMembership";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useOrganizations } from "@/features/organizationList/hooks/useOrganization";
import { useSession } from "@/features/auth/hooks/useSession";

const OrgSwitcher = () => {
    const { isMobile } = useSidebar();
    const { user, isLoading: userLoading } = useSession();
    const { data: membership, isLoading: membershipLoading } = useMembership();
    const { data: orgs, isLoading: orgsLoading } = useOrganizations(user?.userId);
    const navigate = useNavigate();

    if (membershipLoading || orgsLoading || userLoading) {
        return (
            <div className="flex items-center gap-2.5 px-2.5 h-15.5">
                <div className="w-[34px] h-[34px] rounded-[6px] bg-[#e8eaf0] shrink-0" />
                <div className="flex-1 flex flex-col gap-[5px]">
                    <div className="h-2.5 rounded bg-[#e8eaf0] w-[70%]" />
                    <div className="h-2.5 rounded bg-[#e8eaf0] w-[40%]" />
                </div>
            </div>
        );
    }

    if (!membership) return <Navigate to="/login" />;
    if (!orgs) return <Navigate to="/organizations" />;

    const activeOrg = orgs.find((org) => org.slug === membership.slug);
    const displayName = activeOrg?.name || membership.slug;

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="flex items-center gap-2.5 w-full py-7.5 rounded-none border border-transparent bg-transparent cursor-pointer transition-[background,border-color] duration-150 ease-in-out hover:bg-green-50 hover:border-[#e8eaf0]"
                        >
                            <div className="w-[34px] h-[34px] rounded-[6px] bg-green-700 text-white text-[13px] font-semibold tracking-[0.02em] flex items-center justify-center shrink-0 font-[DM_Sans,Geist,system-ui,sans-serif]">
                                {displayName[0].toUpperCase()}
                            </div>
                            <div className="flex-1 flex flex-col items-start min-w-0">
                                <span className="text-[13.5px] font-semibold text-gray-700 leading-[1.3] truncate max-w-[200px] ">
                                    {displayName}
                                </span>
                                <span className="text-[11px] text-[#8892a4] font-normal mt-px">
                                    {membership.role.charAt(0) +
                                        membership.role.slice(1).toLowerCase()}
                                </span>
                            </div>
                            <ChevronsUpDown className="w-3.5 h-3.5 text-[#b5bcc9] shrink-0" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        className="bg-white border mt-2 border-[#e8eaf0] rounded-[14px] shadow-[0_8px_32px_-4px_rgba(30,58,138,0.10),0_2px_8px_-2px_rgba(0,0,0,0.06)] p-1.5 min-w-[220px]"
                        align="start"
                        side={isMobile ? "bottom" : "right"}
                        sideOffset={8}
                    >
                        <DropdownMenuLabel className="text-[10.5px] font-semibold tracking-[0.08em] uppercase text-[#b5bcc9] p-0 ">
                            <Link
                                to="/organizations"
                                className="flex items-center gap-2.5  px-2.5 pt-1.5 pb-1 h-full w-full "
                            >
                                Your organizations
                            </Link>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-[#e8eaf0] my-1 h-px" />

                        {orgs.map((org) => (
                            <DropdownMenuItem
                                key={org.id}
                                onClick={() => navigate(`/${org.slug}`)}
                                className="flex items-center gap-2.5 px-2.5 py-2 rounded-[6px] cursor-pointer text-[13px] text-gray-700 font-[450] transition-colors duration-[120ms] hover:bg-green-50"
                            >
                                <div className="w-[26px] h-[26px] rounded-[6px] bg-green-100 text-green-700 text-[11px] font-bold flex items-center justify-center shrink-0">
                                    {org.name[0].toUpperCase()}
                                </div>
                                <span className="flex-1">{org.name}</span>
                                {org.slug === membership.slug && (
                                    <span className="text-[10px] font-semibold text-green-700 bg-green-100 rounded-full px-[7px] py-0.5 tracking-[0.02em]">
                                        Active
                                    </span>
                                )}
                            </DropdownMenuItem>
                        ))}

                        <DropdownMenuSeparator className="bg-[#e8eaf0] my-1 h-px" />
                        <DropdownMenuItem
                            className="flex items-center gap-2.5 px-2.5 py-2 rounded-[6px] cursor-pointer text-[13px] text-[#8892a4] font-[450] transition-colors duration-[120ms] hover:bg-[#f0f3f9]"
                            asChild
                        >
                            <Link
                                to="/organizations/create"
                                className="flex w-full items-center gap-2.5"
                            >
                                <div className="w-[26px] h-[26px] rounded-[6px] border-[1.5px] border-dashed border-[#e8eaf0] flex items-center justify-center text-[#8892a4] shrink-0">
                                    <Plus className="h-3 w-3" />
                                </div>
                                <span>New organization</span>
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
};

export default OrgSwitcher;
