import * as React from "react";
import OrgSidebar from "@/components/organization/sidebar/OrgSidebar";
import { Separator } from "@/components/ui/separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Outlet, useLocation, useParams } from "react-router-dom";
import { useMembership } from "@/hooks/useMembership";
import IdlePage from "@/components/IdlePage";

const MainOrganizationPage = () => {
    const [currentLocation, setCurrentLocation] = React.useState("");
    const { data: membership, isLoading: membershipLoading } = useMembership();
    const { orgSlug } = useParams<{ orgSlug: string }>();
    const location = useLocation();
    const segments = location.pathname.split("/");

    React.useEffect(() => {
        setCurrentLocation(segments[2]);
    }, [segments]);

    if (!orgSlug) {
        return <div>invalid organization</div>;
    }
    if (!membership) {
        return <div>No membership data</div>;
    }
    if (membershipLoading) {
        return <div>Loading...</div>;
    }

    if (membership.role === "IDLE") {
        return (
            <div className="h-[100vh]">
                <IdlePage />
            </div>
        );
    }

    return (
        <SidebarProvider>
            <OrgSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b">
                    <div className="flex justify-start px-4 w-full">
                        <div className="flex items-center gap-2">
                            <SidebarTrigger className="-ml-1" />
                            <Separator
                                orientation="vertical"
                                className="mr-1 data-[orientation=vertical]:h-4"
                            />
                            <p className="text-xl capitalize font-medium mb-0.5">
                                {currentLocation}
                            </p>
                        </div>
                    </div>
                </header>
                <div className="flex flex-1 flex-col overflow-auto">
                    <Outlet />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default MainOrganizationPage;
