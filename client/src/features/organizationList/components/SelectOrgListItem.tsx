import api from "@/lib/axios";
import { useNavigate } from "react-router-dom";
interface SelectOrgListItemProps {
    readonly name: string;
    readonly index: number;
    readonly id: string;
}

const SelectOrgListItem = ({name, index, id }: SelectOrgListItemProps) => {
    const navigate = useNavigate();

    const handleSubmit = async () => {
        try {
            await api.post("/org/signup", {
                id
            })
            navigate(`/organizations`)
        } catch (error) {
            if(error instanceof Error) console.log(error.message)
        }
    }

    return (
        <li className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
            <button 
                onClick={() => handleSubmit()}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-100 transition-colors w-full"
            >
                <span className="text-sm font-medium text-gray-900">
                    {name}
                </span>
            </button>
        </li>
        
    );
};

export default SelectOrgListItem;