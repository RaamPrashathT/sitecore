import * as React from "react";
import OrgSidebar from "@/components/organization/sidebar/OrgSidebar";
import { Separator } from "@/components/ui/separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Outlet, useLocation, useParams } from "react-router-dom";

const MainOrganizationPage = () => {
    const [currentLocation, setCurrentLocation] = React.useState("");
    
    const { orgSlug } = useParams<{ orgSlug: string }>();
    const location = useLocation();
    const segments = location.pathname.split("/");

    React.useEffect(() => {
        setCurrentLocation(segments[3]);
    }, [segments]);

    if (!orgSlug) {
        return <div>invalid organization</div>;
    }

    return (
        <SidebarProvider>
            <OrgSidebar slug={orgSlug} />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-1 data-[orientation=vertical]:h-4"
                        />
                        <p className="text-xl capitalize font-medium mb-0.5">{currentLocation}</p>
                    </div>
                </header>
                <div className="">
                    <Outlet />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default MainOrganizationPage;
