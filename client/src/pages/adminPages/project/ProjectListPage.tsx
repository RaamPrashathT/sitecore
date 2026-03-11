import ProjectListTable from "@/components/project/manage/ProjectListTable"
import { useMembership } from "@/hooks/useMembership";
import { useProjectList } from "@/hooks/useProjectList";

const ProjectListPage = () => {
    const { data: membership, isLoading: membershipLoading } = useMembership();
    const { data: projects, isLoading: projectsLoading } = useProjectList(membership?.id);

    if(membershipLoading || projectsLoading){
        return <div>Loading...</div>
    }

    if(!membership || !projects){
        return <div>No access</div>
    }
    
    return (
        <div>
            <ProjectListTable data={projects} orgSlug={membership.slug}/>
        </div>
    )
}

export default ProjectListPage