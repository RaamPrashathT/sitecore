import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import type { ProjectDetailsType } from "@/hooks/useProjectDetails";

interface ProjectDetailsProps {
    projectDetails: ProjectDetailsType;
}

const ProjectDetails = ({ projectDetails }: ProjectDetailsProps) => {
    const { name, address, estimatedBudget } = projectDetails;

    return (
        <Card className="shadow-none border-none m-0">
            <CardContent className="p-6 flex flex-col gap-y-2">
                <h3 className="text-xl font-semibold tracking-tight text-foreground">
                    {name}
                </h3>
                <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-1 h-3.5 w-3.5" />
                    {address}
                </div>
                <div>

                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                    Est. Budget:
                </p>
                <div className="flex items-center justify-start  text-lg font-bold text-primary">
                    {estimatedBudget.toLocaleString()}
                </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default ProjectDetails;
