import * as React from "react";
import OrgSidebar from "@/components/organization/sidebar/OrgSidebar";
import { Separator } from "@/components/ui/separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Link, Outlet, useLocation, useParams } from "react-router-dom";
import { useOrg } from "@/hooks/useOrg";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const MainOrganizationPage = () => {
    const [currentLocation, setCurrentLocation] = React.useState("");

    const { orgSlug } = useParams<{ orgSlug: string }>();
    const location = useLocation();
    const segments = location.pathname.split("/");

    const { membership, isLoading } = useOrg();

    React.useEffect(() => {
        setCurrentLocation(segments[segments.length - 1 ]);
    }, [segments]);

    if (!orgSlug) {
        return <div>invalid organization</div>;
    }

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!membership) {
        return <div>No access</div>;
    }

    return (
        <SidebarProvider>
            <OrgSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex justify-between px-4 w-full">
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
                        <div>
                            {(currentLocation === "catalogue" && segments.length === 4)  &&  (
                                <Button>
                                    <Link to={`/org/${orgSlug}/catalogue/create`} className="flex items-center gap-x-1">
                                        <Plus />
                                        <p className="mb-px">Add Item</p>
                                    </Link>
                                </Button>
                            )}
                        </div>
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
