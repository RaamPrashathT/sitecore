import ProjectDetails from "@/components/project/ProjectDetails";
import { useMembership } from "@/hooks/useMembership";
import { useProjectDetails } from "@/hooks/useProjectDetails";
import { useParams } from "react-router-dom";


const ProjectPage = () => {
    const { projectSlug } = useParams();
    const { data: membership, isLoading: membershipLoading } = useMembership();
    const { data: project, isLoading: projectLoading } = useProjectDetails(projectSlug, membership?.id );

    if (membershipLoading || projectLoading) {
        return <div>Loading...</div>;
    }
    if (!membership || !project) {
        return <div>No access</div>;
    }

    return (
        <div>
            <ProjectDetails projectDetails={project} />
        </div>
    );
};

export default ProjectPage;
