import * as React from "react";
import {
    UserRoundCheck,
    ScrollText,
    Users,
    Mail,
    ChartArea,
    Bell,
    Settings,
    FolderDot, // Icon for individual projects
    Folder // Icon for all projects
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import SidebarContents from "@/components/organization/sidebar/SidebarContents";
import SidebarUser from "@/components/organization/sidebar/SidebarUserProfile";
import OrgSwitcher from "@/components/organization/sidebar/SidebarOrgSwitcher";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar";
import { Link, useLocation, useParams } from "react-router-dom";
import { useMembership } from "@/hooks/useMembership";
import { useProjectList } from "@/features/project/manage/hooks/useProjectList"; 

type SidebarItem = {
    title: string;
    url: string;
    icon: LucideIcon;
};

type SidebarGroupType = Record<string, SidebarItem[]>;

const OrgSidebar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
    const { orgSlug } = useParams<{ orgSlug: string }>();
    const location = useLocation();
    
    const { data: membership, isLoading: membershipLoading } = useMembership();
    
    // Fetch projects (Automatically scoped by backend: Admin gets all, others get assigned)
    const { data: projectsData, isLoading: projectsLoading } = useProjectList(
        membership?.id,
        0,
        50, // Fetch up to 50 projects to list in the sidebar
        ""
    );

    const isInitialLoading = membershipLoading || projectsLoading;

    if (isInitialLoading) {
        return (
            <div className="w-60 h-screen bg-white flex items-start p-5">
                <div className="w-full h-10 rounded-[10px] bg-linear-to-r from-[#e8eaf0] via-[#f0f3f9] to-[#e8eaf0] bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
            </div>
        );
    }

    if (!membership) {
        return (
            <div className="text-sm text-[#8892a4] p-4">
                No membership found
            </div>
        );
    }

    // Map individual projects for the sidebar
    const projectItems: SidebarItem[] = (projectsData?.data || []).map((project) => ({
        title: project.name,
        url: `/${project.slug}`, 
        icon: FolderDot,
    }));

    // Build the Sidebar dynamically based on role
    let dynamicContents: SidebarGroupType[] = [];

    if (membership.role === "ADMIN") {
        dynamicContents = [
            {
                Overview: [
                    { title: "Dashboard", url: "/", icon: ChartArea },
                    { title: "All Projects", url: "/projects", icon: Folder },
                ],
            }
        ];

        // Insert the individual projects subheading
        if (projectItems.length > 0) {
            dynamicContents.push({
                Projects: projectItems
            });
        }

        dynamicContents.push(
            {
                Management: [
                    { title: "Catalogue", url: "/catalogue", icon: ScrollText },
                    { title: "Engineers", url: "/engineers", icon: UserRoundCheck },
                    { title: "Clients", url: "/clients", icon: Users },
                ],
            },
            {
                Pending: [
                    { title: "Invitations", url: "/pending-invitations", icon: Mail },
                ],
            }
        );
    } else {
        // ENGINEER & CLIENT VIEW
        dynamicContents = [
            {
                Overview: [
                    { title: "Dashboard", url: "/", icon: ChartArea },
                ],
            }
        ];

        if (projectItems.length > 0) {
            dynamicContents.push({
                Projects: projectItems
            });
        }
    }

    return (
        <Sidebar
            collapsible="offcanvas"
            {...props}
            className="bg-white border-r font-[DM_Sans,Geist,system-ui,sans-serif]"
        >
            <SidebarHeader className="bg-white p-0 border-b">
                <OrgSwitcher />
            </SidebarHeader>
            <SidebarContent className="bg-white py-2 flex flex-col h-full">
                
                {/* Main Dynamic Role Content */}
                <SidebarContents
                    groups={dynamicContents.map((group) => {
                        const [label, items] = Object.entries(group)[0];

                        return {
                            label,
                            items: items.map((item) => ({
                                ...item,
                                // Automatically prepends orgSlug so individual projects become /orgSlug/projectSlug
                                url: `/${orgSlug}${item.url}`,
                            })),
                        };
                    })}
                />

                {/* Static Bottom Pinned Items */}
                <SidebarGroup className="mt-auto px-2.5 py-0 mb-2">
                    {membership.role === "ADMIN" ? (
                        <SidebarMenu className="flex flex-col gap-0.5">
                        {[
                            { title: "Notifications", url: `/${orgSlug}/notifications`, icon: Bell },
                        ].map((item) => {
                            const isActive = location.pathname === item.url;

                            return (
                                <SidebarMenuItem key={item.title} className="list-none">
                                    <Link to={item.url} className="block no-underline">
                                        <SidebarMenuButton
                                            tooltip={item.title}
                                            className={`flex items-center gap-2.5 w-full px-2.5 py-2 rounded-sm border transition-all hover:bg-green-50 ${
                                                isActive
                                                    ? "bg-green-50 border-l-4 border-green-700"
                                                    : "bg-transparent border-transparent"
                                            }`}
                                        >
                                            <span
                                                className={`w-4 h-4 flex items-center justify-center ${
                                                    isActive ? "text-green-700" : "text-gray-700"
                                                }`}
                                            >
                                                <item.icon />
                                            </span>

                                            <span
                                                className={`${
                                                    isActive ? "text-green-700 font-semibold" : "text-gray-700"
                                                }`}
                                            >
                                                {item.title}
                                            </span>
                                        </SidebarMenuButton>
                                    </Link>
                                </SidebarMenuItem>
                            );
                        })}
                    </SidebarMenu>
                    ): (
                        <SidebarMenu className="flex flex-col gap-0.5">
                        {[
                            { title: "Notifications", url: `/${orgSlug}/notifications`, icon: Bell },
                        ].map((item) => {
                            const isActive = location.pathname === item.url;

                            return (
                                <SidebarMenuItem key={item.title} className="list-none">
                                    <Link to={item.url} className="block no-underline">
                                        <SidebarMenuButton
                                            tooltip={item.title}
                                            className={`flex items-center gap-2.5 w-full px-2.5 py-2 rounded-sm border transition-all hover:bg-green-50 ${
                                                isActive
                                                    ? "bg-green-50 border-l-4 border-green-700"
                                                    : "bg-transparent border-transparent"
                                            }`}
                                        >
                                            <span
                                                className={`w-4 h-4 flex items-center justify-center ${
                                                    isActive ? "text-green-700" : "text-gray-700"
                                                }`}
                                            >
                                                <item.icon />
                                            </span>

                                            <span
                                                className={`${
                                                    isActive ? "text-green-700 font-semibold" : "text-gray-700"
                                                }`}
                                            >
                                                {item.title}
                                            </span>
                                        </SidebarMenuButton>
                                    </Link>
                                </SidebarMenuItem>
                            );
                        })}
                    </SidebarMenu>
                    )}
                </SidebarGroup>
            </SidebarContent>
            
            <SidebarFooter className="bg-white border-t p-0">
                <SidebarUser />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
};

export default OrgSidebar;