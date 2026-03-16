import { DataTable } from "@/components/DataTable";
import { projectColumns } from "./components/projectColumns";
import { useMembership } from "@/hooks/useMembership";
import { useProjectList } from "./hooks/useProjectList";
import EmptyProjectList from "./components/EmptyProjectList";

const ProjectManage = () => {
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

    if (projects.length === 0) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center mb-12">
                <EmptyProjectList />
            </div>
        );
    }
    return (
        <div>
            <DataTable columns={projectColumns} data={projects} />
        </div>
    );
};

export default ProjectManage;
