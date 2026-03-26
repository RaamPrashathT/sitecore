import { CreateOrgForm } from "@/features/organizationList/components/CreateOrgForm";
import { useNavigate } from "react-router-dom";
const CreateOrgPage = () => {
    const navigate = useNavigate();
    return <CreateOrgForm onSuccess={(slug) => navigate(`/${slug}`)} />;
};

export default CreateOrgPage;
