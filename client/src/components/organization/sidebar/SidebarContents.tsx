import { type LucideIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

const SidebarContents = ({
    groups,
}: {
    readonly groups: {
        label: string;
        items: {
            title: string;
            url: string;
            icon?: LucideIcon;
        }[];
    }[];
}) => {
    const location = useLocation();

    return (
        <>
            {groups.map((group) => (
                <SidebarGroup key={group.label} className="px-2.5 py-0 my-0">
                    <SidebarGroupLabel className="text-[10px] font-bold tracking-[0.09em] uppercase text-gray-700 px-1.5 mb-1.5">
                        {group.label}
                    </SidebarGroupLabel>
                    <SidebarMenu className="flex flex-col gap-0.5">
                        {group.items.map((item) => {
                            const isActive =
                                location.pathname === item.url;

                            return (
                                <SidebarMenuItem key={item.title} className="list-none">
                                    <Link to={item.url} className="block no-underline">
                                        <SidebarMenuButton
                                            tooltip={item.title}
                                            className={`flex items-center gap-2.5 w-full px-2.5 py-2 rounded-sm border transition-all hover:bg-green-50 ${
                                                isActive
                                                    ? "bg-green-50 border-l-4 border-green-700"
                                                    : "bg-transparent border-transparent "
                                            }`}
                                        >
                                            {item.icon && (
                                                <span
                                                    className={`w-4 h-4 flex items-center justify-center ${
                                                        isActive
                                                            ? "text-green-700"
                                                            : "text-gray-700"
                                                    }`}
                                                >
                                                    <item.icon />
                                                </span>
                                            )}

                                            <span
                                                className={`${
                                                    isActive
                                                        ? "text-green-700 font-semibold"
                                                        : "text-gray-700"
                                                }`}
                                            >
                                                {item.title}
                                            </span>
                                        </SidebarMenuButton>
                                    </Link>
                                </SidebarMenuItem>
                            );
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            ))}
        </>
    );
};

export default SidebarContents;