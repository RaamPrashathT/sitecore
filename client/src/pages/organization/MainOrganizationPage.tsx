import OrgSidebar from "@/components/organization/sidebar/OrgSidebar";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Outlet, useLocation, useParams, useNavigate } from "react-router-dom";
import { useMembership } from "@/hooks/useMembership";
import IdlePage from "@/components/IdlePage";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, HardHat, UsersRound, ClipboardList, Banknote } from "lucide-react";

const MainOrganizationPage = () => {
    const { data: membership, isLoading: membershipLoading } = useMembership();
    const { orgSlug, projectSlug } = useParams<{
        orgSlug: string;
        projectSlug?: string;
    }>();

    const location = useLocation();
    const navigate = useNavigate();

    const pathParts = location.pathname.split("/").filter(Boolean);
    const currentTab = pathParts[2] || "details";

    const handleTabChange = (value: string) => {
        if (!orgSlug || !projectSlug) return;

        if (value === "details") {
            navigate(`/${orgSlug}/${projectSlug}`);
        } else {
            navigate(`/${orgSlug}/${projectSlug}/${value}`);
        }
    };

    if (!orgSlug) return <div>invalid organization</div>;
    if (!membership) return <div>No membership data</div>;
    if (membershipLoading) return <div>Loading...</div>;

    if (membership.role === "IDLE") {
        return (
            <div className="h-[92vh]">
                <IdlePage />
            </div>
        );
    }

    return (
        <SidebarProvider className="h-screen">
            <OrgSidebar />

            <SidebarInset className="flex flex-col h-full">
                <header className="flex h-15.5 items-center justify-between border-b px-4">
                    <div className="flex items-center gap-4 w-full ">
                        <SidebarTrigger />

                        {projectSlug && (
                            <div className="flex items-center justify-between w-full">
                                <p className="font-medium text-sm capitalize">
                                    {projectSlug}
                                </p>

                                <Tabs
                                    value={currentTab}
                                    onValueChange={handleTabChange}
                                >
                                    <TabsList className="bg-transparent p-0 flex gap-4 ml-4">
                                        <TabsTrigger
                                            value="details"
                                            className="flex items-center gap-1 px-2 py-1 text-sm border-b-2 border-transparent data-[state=active]:border-green-700 data-[state=active]:text-green-700"
                                        >
                                            <Form className="w-4 h-4" />
                                            Details
                                        </TabsTrigger>

                                        <TabsTrigger
                                            value="progress"
                                            className="flex items-center gap-1 px-2 py-1 text-sm border-b-2 border-transparent data-[state=active]:border-green-700 data-[state=active]:text-green-700"
                                        >
                                            <HardHat className="w-4 h-4" />
                                            Progress
                                        </TabsTrigger>

                                        <TabsTrigger
                                            value="requisitions"
                                            className="flex items-center gap-1 px-2 py-1 text-sm border-b-2 border-transparent data-[state=active]:border-green-700 data-[state=active]:text-green-700"
                                        >
                                            <ClipboardList className="w-4 h-4" />
                                            Requisitions
                                        </TabsTrigger>

                                        <TabsTrigger
                                            value="members"
                                            className="flex items-center gap-1 px-2 py-1 text-sm border-b-2 border-transparent data-[state=active]:border-green-700 data-[state=active]:text-green-700"
                                        >
                                            <UsersRound className="w-4 h-4" />
                                            Members
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="payments"
                                            className="flex items-center gap-1 px-2 py-1 text-sm border-b-2 border-transparent data-[state=active]:border-green-700 data-[state=active]:text-green-700"
                                        >
                                            <Banknote className="w-4 h-4" />
                                            Payments
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>
                        )}
                    </div>
                </header>

                <div className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto">
                        <Outlet />
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default MainOrganizationPage;
