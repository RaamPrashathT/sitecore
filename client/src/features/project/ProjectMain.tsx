import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, HardHat, UsersRound, ClipboardList } from "lucide-react";

const ProjectMain = () => {
    const { orgSlug, projectSlug } = useParams<{ orgSlug: string; projectSlug: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const pathParts = location.pathname.split("/").filter(Boolean);
    const currentTab = pathParts[2] || "details";

    const handleTabChange = (value: string) => {
        if (value === "details") {
            navigate(`/${orgSlug}/${projectSlug}`);
        } else {
            navigate(`/${orgSlug}/${projectSlug}/${value}`);
        }
    };

    return (
        <div className="flex flex-col w-full h-full">
            <div className="sticky top-0 z-10 bg-white border-b pt-2 px-6">
                <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
                    <TabsList className="bg-transparent h-auto p-0 flex gap-6 justify-start">
                        <TabsTrigger
                            value="details"
                            className="flex flex-row items-center gap-2 pb-3 pt-2 px-1 border-b-2 border-transparent data-[state=active]:border-green-700 data-[state=active]:text-green-700 data-[state=active]:shadow-none rounded-none bg-transparent hover:text-green-700 transition-colors"
                        >
                            <Form className="w-4 h-4" />
                            <p className="font-medium">Details</p>
                        </TabsTrigger>
                        
                        <TabsTrigger
                            value="progress"
                            className="flex flex-row items-center gap-2 pb-3 pt-2 px-1 border-b-2 border-transparent data-[state=active]:border-green-700 data-[state=active]:text-green-700 data-[state=active]:shadow-none rounded-none bg-transparent hover:text-green-700 transition-colors"
                        >
                            <HardHat className="w-4 h-4" />
                            <p className="font-medium">Progress</p>
                        </TabsTrigger>

                        <TabsTrigger
                            value="requisitions"
                            className="flex flex-row items-center gap-2 pb-3 pt-2 px-1 border-b-2 border-transparent data-[state=active]:border-green-700 data-[state=active]:text-green-700 data-[state=active]:shadow-none rounded-none bg-transparent hover:text-green-700 transition-colors"
                        >
                            <ClipboardList className="w-4 h-4" />
                            <p className="font-medium">Requisitions</p>
                        </TabsTrigger>

                        <TabsTrigger
                            value="members"
                            className="flex flex-row items-center gap-2 pb-3 pt-2 px-1 border-b-2 border-transparent data-[state=active]:border-green-700 data-[state=active]:text-green-700 data-[state=active]:shadow-none rounded-none bg-transparent hover:text-green-700 transition-colors"
                        >
                            <UsersRound className="w-4 h-4" />
                            <p className="font-medium">Members</p>
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* This is where your specific Tab Components (ProjectDetails, etc.) will render */}
            <div className="flex-1 overflow-y-auto bg-gray-50/30">
                <Outlet />
            </div>
        </div>
    );
};

export default ProjectMain;