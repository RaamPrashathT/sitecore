import ProjectListTable from "@/components/project/manage/ProjectListTable";
import { useMembership } from "@/hooks/useMembership";
import { useProjectList } from "@/features/project/manage/hooks/useProjectList";
import ProjectManage from "@/features/project/manage/projectManage";

const ProjectListPage = () => {
    const { data: membership, isLoading: membershipLoading } = useMembership();
    const { data: projects, isLoading: projectsLoading } = useProjectList(
        membership?.id,
    );

    if (membershipLoading || projectsLoading) {
        return <div>Loading...</div>;
    }

    if (!membership || !projects) {
        return <div>No access</div>;
    }

    return (
        <div className="h-full flex flex-col">
            <ProjectListTable data={projects} orgSlug={membership.slug} />
            {/* <ProjectManage /> */}
        </div>
    );
};

export default ProjectListPage;
