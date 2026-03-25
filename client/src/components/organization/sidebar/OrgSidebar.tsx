import * as React from "react";
import {
    UserRoundCheck,
    ScrollText,
    ChartNoAxesGantt,
    SquareTerminal,
    Users,
    ClipboardClock,
    ClipboardPlus,
    Mail
} from "lucide-react";

import SidebarContents from "@/components/organization/sidebar/SidebarContents";
import SidebarUser from "@/components/organization/sidebar/SidebarUserProfile";
import OrgSwitcher from "@/components/organization/sidebar/SidebarOrgSwitcher";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar";
import { useParams } from "react-router-dom";
import { useMembership } from "@/hooks/useMembership";


const adminData = {
    sidebarContents: [
        { title: "Dashboard", url: "/", icon: SquareTerminal },
        { title: "Catalogue", url: "/catalogue", icon: ScrollText },
        { title: "Engineers", url: "/engineers", icon: UserRoundCheck },
        { title: "Clients", url: "/clients", icon: Users },
        { title: "Projects", url: "/projects", icon: ChartNoAxesGantt },
        { title: "Pending Payments", url: "/pending-payments", icon: ClipboardClock },
        { title: "Pending Requests", url: "/pending-requisitions", icon: ClipboardPlus },
        { title: "Pending Invitations", url: "/pending-invitations", icon: Mail },
    ],
};

const engineerData = {
    sidebarContents: [
        { title: "Dashboard", url: "/", icon: SquareTerminal, isActive: true },
        { title: "Projects", url: "/projects", icon: ChartNoAxesGantt },
    ]
};

const clientData = {
    sidebarContents: [
        { title: "Dashboard", url: "/", icon: SquareTerminal, isActive: true },
        { title: "Projects", url: "/projects", icon: ChartNoAxesGantt },
    ]
};

const OrgSidebar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
    const { orgSlug } = useParams<{ orgSlug: string }>();
    const { data: membership, isLoading: membershipLoading } = useMembership();

    if (membershipLoading) {
        return (
            <div className="w-60 h-screen bg-white flex items-start p-5">
                <div className="w-full h-10 rounded-[10px] bg-gradient-to-r from-[#e8eaf0] via-[#f0f3f9] to-[#e8eaf0] bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
            </div>
        );
    }

    if (!membership) {
        return <div className="text-sm text-[#8892a4] p-4">No membership found</div>;
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
            className="bg-white border-r  font-[DM_Sans,Geist,system-ui,sans-serif]"
        >
            <SidebarHeader className="bg-white p-0 border-b ">
                <OrgSwitcher />
            </SidebarHeader>
            <SidebarContent className="bg-white py-2">
                <SidebarContents
                    items={roleData.sidebarContents.map((item) => ({
                        ...item,
                        url: `/${orgSlug}${item.url}`,
                    }))}
                />
            </SidebarContent>
            <SidebarFooter className="bg-white border-t p-0">
                <SidebarUser />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
};

export default OrgSidebar;