import * as React from "react";
import {
    UserRoundCheck,
    ScrollText,
    ChartNoAxesGantt,
    SquareTerminal,
    Users,
    ClipboardClock,
    ClipboardPlus,
    Mail,
    ChartArea,
    Presentation,
    Bell,
    Settings,
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

type SidebarItem = {
    title: string;
    url: string;
    icon: LucideIcon;
};
type SidebarGroupType = Record<string, SidebarItem[]>;

const adminData: { sidebarContents: SidebarGroupType[] } = {
    sidebarContents: [
        {
            Overview: [
                { title: "Dashboard", url: "/", icon: ChartArea },
                { title: "Projects", url: "/projects", icon: Presentation },
            ],
        },
        {
            Management: [
                { title: "Catalogue", url: "/catalogue", icon: ScrollText },
                { title: "Engineers", url: "/engineers", icon: UserRoundCheck },
                { title: "Clients", url: "/clients", icon: Users },
            ],
        },
        {
            Pending: [
                {
                    title: "Payments",
                    url: "/pending-payments",
                    icon: ClipboardClock,
                },
                {
                    title: "Requests",
                    url: "/pending-requisitions",
                    icon: ClipboardPlus,
                },
                {
                    title: "Invitations",
                    url: "/pending-invitations",
                    icon: Mail,
                },
            ],
        },
    ],
};

const engineerData = {
    sidebarContents: [
        {
            Overview: [
                { title: "Dashboard", url: "/", icon: SquareTerminal },
                { title: "Projects", url: "/projects", icon: ChartNoAxesGantt },
            ],
        },
    ],
};

const clientData = {
    sidebarContents: [
        {
            Overview: [
                { title: "Dashboard", url: "/", icon: SquareTerminal },
                { title: "Projects", url: "/projects", icon: ChartNoAxesGantt },
            ],
        },
    ],
};

const OrgSidebar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
    const { orgSlug } = useParams<{ orgSlug: string }>();
    const { data: membership, isLoading: membershipLoading } = useMembership();
    const location = useLocation();

    if (membershipLoading) {
        return (
            <div className="w-60 h-screen bg-white flex items-start p-5">
                <div className="w-full h-10 rounded-[10px] bg-linear-to-r from-[#e8eaf0] via-[#f0f3f9] to-[#e8eaf0] bg-size-[200%_100%] animate-[shimmer_1.5s_infinite]" />
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

    const roleDataMap: Record<string, typeof adminData> = {
        ADMIN: adminData,
        ENGINEER: engineerData,
        CLIENT: clientData,
    };

    const roleData = roleDataMap[membership.role] ?? engineerData;

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
                    groups={roleData.sidebarContents.map((group) => {
                        const [label, items] = Object.entries(group)[0];

                        return {
                            label,
                            items: items.map((item) => ({
                                ...item,
                                url: `/${orgSlug}${item.url}`,
                            })),
                        };
                    })}
                />

                {/* Static Bottom Pinned Items */}
                <SidebarGroup className="mt-auto px-2.5 py-0 mb-2">
                    <SidebarMenu className="flex flex-col gap-0.5">
                        {[
                            { title: "Notifications", url: `/${orgSlug}/notifications`, icon: Bell },
                            { title: "Settings", url: `/${orgSlug}/settings`, icon: Settings },
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