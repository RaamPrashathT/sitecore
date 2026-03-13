import * as React from "react";
import {
    UserRoundCheck,
    ScrollText,
    Settings2,
    ChartNoAxesGantt,
    SquareTerminal,
    Users,
    ClipboardClock
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



const data = {
    sidebarContents: [
        {
            title: "Dashboard",
            url: "/",
            icon: SquareTerminal,
            isActive: true,
            
        },
        {
            title: "Catalogue",
            url: "/catalogue",
            icon: ScrollText,
            
        },
        {
            title: "Engineers",
            url: "/engineers",
            icon: UserRoundCheck,
            
        },
        {
            title: "Clients",
            url: "/clients",
            icon: Users,
            
        },
        {
            title: "Projects",
            url: "/projects",
            icon: ChartNoAxesGantt,
        },
        {
            title: "Pending Requests",
            url: "/pending-requests",
            icon: ClipboardClock,
        },
        {
            title: "Settings",
            url: "/settings",
            icon: Settings2,
        },
    ],
};

const OrgSidebar = ({...props }: React.ComponentProps<typeof Sidebar>) => {
    const { orgSlug } = useParams<{ orgSlug: string }>();
    return (

        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <OrgSwitcher/>
            </SidebarHeader>
            <SidebarContent>
                <SidebarContents items={data.sidebarContents.map((item) => ({
                    ...item,
                    url: `/${orgSlug}${item.url}`,
                }))}/>
            </SidebarContent>
            <SidebarFooter>
                <SidebarUser/>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>

    );
}

export default OrgSidebar;