import { Link } from "react-router-dom";

type Role = "ADMIN" | "ENGINEER" | "CLIENT";

interface OrgListItemProps {
    readonly role: Role;
    readonly name: string;
    readonly slug: string;
    readonly index: number;
}

const OrgListItem = ({ role, name, slug, index }: OrgListItemProps) => {
    return (
        <li className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
            <Link
                to={`/org/${slug}`}
                className="flex items-center justify-between px-4 py-3  transition-colors"
            >
                <span className="text-sm font-medium text-gray-900">
                    {name}
                </span>
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                    {role}
                </span>
            </Link>
        </li>
    );
};

export default OrgListItem;
