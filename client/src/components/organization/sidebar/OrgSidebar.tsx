import * as React from "react";
import {
    UserRoundCheck,
    ScrollText,
    ChartNoAxesGantt,
    SquareTerminal,
    Users,
    ClipboardClock,
    ClipboardPlus
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
            title: "Pending Payments",
            url: "/pending-payments",
            icon: ClipboardClock,
        },
        {
            title: "Pending Requests",
            url: "/pending-requisitions",
            icon: ClipboardPlus,
        },
    ],
};

const engineerData = {
    sidebarContents: [
        {
            title: "Projects",
            url: "/projects",
            icon: ChartNoAxesGantt,
        },
    ]
}

const clientData = {
    sidebarContents: [
        {
            title: "Projects",
            url: "/projects",
            icon: ChartNoAxesGantt,
        },
    ]
}

const OrgSidebar = ({...props }: React.ComponentProps<typeof Sidebar>) => {
    const { orgSlug } = useParams<{ orgSlug: string }>();
    const {data: membership, isLoading: membershipLoading} = useMembership();

    if(membershipLoading){
        return <div>Loading...</div>
    }

    if(!membership){
        return <div>No membership found</div>;
    }

    return (

        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <OrgSwitcher/>
            </SidebarHeader>
            <SidebarContent>
                {membership.role === "ADMIN" && (
                    <SidebarContents items={adminData.sidebarContents.map((item) => ({
                        ...item,
                        url: `/${orgSlug}${item.url}`,
                    }))}/>
                )}
                {membership.role === "ENGINEER" && (
                    <SidebarContents items={engineerData.sidebarContents.map((item) => ({
                        ...item,
                        url: `/${orgSlug}${item.url}`,
                    }))}/>
                )}
                {membership.role === "CLIENT" && (
                    <SidebarContents items={clientData.sidebarContents.map((item) => ({
                        ...item,
                        url: `/${orgSlug}${item.url}`,
                    }))}/>
                )}
            </SidebarContent>
            <SidebarFooter>
                <SidebarUser/>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>

    );
}

export default OrgSidebar;