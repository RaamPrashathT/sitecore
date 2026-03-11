import * as React from "react";
import {
    AudioWaveform,
    UserRoundCheck,
    ScrollText,
    Command,
    GalleryVerticalEnd,
    Settings2,
    ChartNoAxesGantt,
    SquareTerminal,
    Users
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
    user: {
        name: "Raam Prashath T",
        email: "raamthiruna@gmail.com",
        avatar: "/avatars/raam.jpg",
    },
    orgs: [
        {
            name: "Site Core",
            logo: GalleryVerticalEnd,
            role: "Admin",
        },
        {
            name: "Acme Corp.",
            logo: AudioWaveform,
            role: "Client",
        },
        {
            name: "Evil Corp.",
            logo: Command,
            role: "Engineer",
        },
    ],
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
                <OrgSwitcher orgs={data.orgs} />
            </SidebarHeader>
            <SidebarContent>
                <SidebarContents items={data.sidebarContents.map((item) => ({
                    ...item,
                    url: `/${orgSlug}${item.url}`,
                }))}/>
            </SidebarContent>
            <SidebarFooter>
                <SidebarUser user={data.user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>

    );
}

export default OrgSidebar;