import CreateProjectForm from "@/features/project/manage/components/CreateProjectForm";
import { useMembership } from "@/hooks/useMembership";

const CreateProjectPage = () => {
    const { data: membership, isLoading } = useMembership();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!membership) return <div>No access</div>;

    return (
        <div className="">
            <CreateProjectForm orgId={membership.id} slug={membership.slug} />
        </div>
    );
};

export default CreateProjectPage;
