import { Link } from "react-router-dom";

interface OrgListItemProps {
    readonly role: string;
    readonly orgName: string;
    readonly index: number;
}

const OrgListItem = (props: OrgListItemProps) => {

    const slug = props.orgName
        .trim()
        .replaceAll(/\s+/g, '-');

    return (
        <li className={props.index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
            <Link
                to={`/org/${slug}`}
                className="flex items-center justify-between px-4 py-3  transition-colors"
            >
                <span className="text-sm font-medium text-gray-900">{props.orgName}</span>
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{props.role}</span>
            </Link>
        </li>
    );
};

export default OrgListItem;