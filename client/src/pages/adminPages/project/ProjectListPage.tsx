import ProjectListTable from "@/components/project/manage/ProjectListTable";
import { useMembership } from "@/hooks/useMembership";
import { useProjectList } from "@/features/project/manage/hooks/useProjectList";
// import ProjectManage from "@/features/project/manage/projectManage";
import EmptyProjectList from "@/features/project/manage/components/EmptyProjectList";

const ProjectListPage = () => {
    const { data: membership, isLoading: membershipLoading } = useMembership();
    const { data: projects, isLoading: projectsLoading } = useProjectList(
        membership?.id,
    );

    if (membershipLoading || projectsLoading) {
        return <div>Loading...</div>;
    }

    if (!membership) {
        return <div>No access</div>;
    }

    if(!projects || projects.length === 0) {
        return <EmptyProjectList/>;
    }

    return (
        <div className="h-full flex flex-col">
            <ProjectListTable data={projects} orgSlug={membership.slug} />
            {/* <ProjectManage /> */}
        </div>
    );
};

export default ProjectListPage;
