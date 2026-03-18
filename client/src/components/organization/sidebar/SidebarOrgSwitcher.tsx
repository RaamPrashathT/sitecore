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
import { AvatarFallback, Avatar } from "@/components/ui/avatar";
import { useOrganizations } from "@/features/organizationList/hooks/useOrganization";

const OrgSwitcher = () => {
    const { isMobile } = useSidebar();

    const { data: membership, isLoading: membershipLoading } = useMembership();
    const { data: orgs, isLoading: orgsLoading } = useOrganizations();
    const navigate = useNavigate();
    if (membershipLoading || orgsLoading) {
        return <div>Loading...</div>;
    }

    if (!membership) {
        return <Navigate to="/login" />;
    }

    if (!orgs) {
        return <Navigate to="/organizations" />;
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <div >
                                <Avatar className="flex aspect-square size-8 items-center justify-center rounded-lg  text-sidebar-primary-foreground" >
                                    <AvatarFallback className="rounded-lg bg-purple-500 text-white">
                                        {membership.name[0].toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">
                                    {membership.name}
                                </span>
                                <span className="truncate text-xs capitalize">
                                    {membership.role.toLowerCase()}
                                </span>
                            </div>
                            <ChevronsUpDown className="ml-auto" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        align="start"
                        side={isMobile ? "bottom" : "right"}
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="text-xs text-muted-foreground">
                            Organizations
                        </DropdownMenuLabel>
                        {orgs.map((org) => (
                            <DropdownMenuItem
                                key={org.id}
                                onClick={() => navigate(`/${org.slug}/projects`)}
                                className="gap-2 p-2"
                            >
                                <div className="flex size-6 items-center justify-center rounded-md border">
                                    <Avatar>
                                        <AvatarFallback>
                                            {org.name[0].toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                                {org.name}
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 p-2">
                            <Link
                                to={"/organizations/create"}
                                className="flex w-full items-center gap-x-2"
                            >
                                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                                    <Plus className="size-4" />
                                </div>
                                <div className="font-medium text-muted-foreground">
                                    Add Organization
                                </div>
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
};

export default OrgSwitcher;
