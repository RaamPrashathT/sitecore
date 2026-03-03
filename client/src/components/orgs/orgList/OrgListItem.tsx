import { useNavigate } from "react-router-dom";

interface OrgListItemProps {
    id: string;
    organizationName: string;
    role: string;
}

const OrgListItem = (data: OrgListItemProps) => {
    const navigate = useNavigate();

    return (
        <button 
            className="w-full"
            onClick={() => navigate(`/org/${data.organizationName}`)}
        >
            <li className="flex px-3 bg-green-200 items-center justify-between border-grey border-t border-b ">
                <p>{data.organizationName}</p>
                <p>{data.role}</p>
            </li>
        </button>
    );
};

export default OrgListItem;
