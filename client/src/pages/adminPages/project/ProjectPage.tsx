import ProjectDetails from "@/features/project/ProjectMain";
import { useMembership } from "@/hooks/useMembership";
import { useProjectDetails } from "@/hooks/useProjectDetails";
import { useNavigate, useParams } from "react-router-dom";
import { usePhaseList } from "@/features/project/phase/hooks/usePhaseList";
import PhaseList from "@/features/project/phase/components/PhaseList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const ProjectPage = () => {
    const { projectSlug } = useParams();
    const { data: membership, isLoading: membershipLoading } = useMembership();
    const { data: project, isLoading: projectLoading } = useProjectDetails(
        projectSlug,
        membership?.id,
    );
    const { data: phase, isLoading: phaseLoading } = usePhaseList(
        project?.id,
        membership?.id,
    );
    const navigate = useNavigate();

    if (membershipLoading || projectLoading || phaseLoading) {
        return <div>Loading...</div>;
    }
    if (!membership || !project || !phase) {
        return <div>No access</div>;
    }
    return (
        <div>
            <ProjectDetails projectDetails={project} />
            <div className="flex justify-between items-center px-6">
                <h1 className="text-2xl font-semibold">Phases:</h1>
                {membership.role !== "CLIENT" && (
                    <Button
                        onClick={() => navigate("create-phase")}
                        className="flex items-center justify-center gap-x-1"
                    >
                        <Plus className="" />
                        Create Phase
                    </Button>
                )}
            </div>
            <PhaseList phases={phase} />
        </div>
    );
};

export default ProjectPage;
