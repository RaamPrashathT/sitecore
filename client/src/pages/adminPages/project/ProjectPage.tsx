import ProjectDetails from "@/components/project/ProjectDetails";
import { useMembership } from "@/hooks/useMembership";
import { useProjectDetails } from "@/hooks/useProjectDetails";
import { useNavigate, useParams } from "react-router-dom";
import { usePhaseList } from "@/hooks/usePhaseList";
import PhaseList from "@/components/project/phase/PhaseList";
import { Button } from "@/components/ui/button";


const ProjectPage = () => {
    const { projectSlug } = useParams();
    const { data: membership, isLoading: membershipLoading } = useMembership();
    const { data: project, isLoading: projectLoading } = useProjectDetails(projectSlug, membership?.id );
    const { data: phase, isLoading: phaseLoading } = usePhaseList(project?.id, membership?.id);
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
            <Button onClick={() => navigate("create-phase")}>
                Create Phase
            </Button>
            <PhaseList phases={phase} />
        </div>
    );
};

export default ProjectPage;
