import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, HardHat, UsersRound   } from "lucide-react";
import {ProjectMembersMain} from "./members/components/ProjectMembersMain";
import ProjectPhaseMain from "./phase/components/ProjectPhaseMain";
import ProjectDetails from "./details/ProjectDetails";

const ProjectMain = () => {
    return (
        <div className="flex flex-col">
            <div>
                <Tabs defaultValue="details" className="w-full ">
                    <TabsList className="bg-white" variant={"line"}>
                        <TabsTrigger
                            value="details"
                            className="flex flex-row items-center"
                        >
                            <Form className="mt-[2px]" />
                            <p>Details</p>
                        </TabsTrigger>
                        <TabsTrigger
                            value="progress"
                            className="flex flex-row items-center"
                        >
                            <HardHat className="mt-[2.5px]" />
                            <p>Progress</p>
                        </TabsTrigger>
                        
                        <TabsTrigger
                            value="members"
                            className="flex flex-row items-center"
                        >
                            <UsersRound className="mt-[2.5px]" />
                            <p>Members</p>
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="details">
                        <ProjectDetails />
                    </TabsContent>
                    
                    <TabsContent value="phases">
                        <ProjectPhaseMain />
                    </TabsContent>
                    <TabsContent value="members">
                        <ProjectMembersMain />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default ProjectMain;
