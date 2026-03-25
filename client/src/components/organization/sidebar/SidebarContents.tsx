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
    items,
}: {
    readonly items: {
        title: string;
        url: string;
        icon?: LucideIcon;
        isActive?: boolean;
    }[];
}) => {
    const location = useLocation();

    return (
        <SidebarGroup className="px-2.5 pt-2.5 pb-1">
            <SidebarGroupLabel className="text-[10px] font-bold tracking-[0.09em] uppercase text-[#b5bcc9] px-1.5 mb-1.5">
                Navigation
            </SidebarGroupLabel>
            <SidebarMenu className="flex flex-col gap-0.5">
                {items.map((item) => {
                    const isActive =
                        item.isActive || location.pathname === item.url;
                    return (
                        <SidebarMenuItem key={item.title} className="list-none">
                            <Link to={item.url} className="block no-underline">
                                <SidebarMenuButton
                                    tooltip={item.title}
                                    className={`flex items-center gap-2.5 w-full px-2.5 py-2 rounded-sm border cursor-pointer transition-[background,border-color]  ease-in-out font-[DM_Sans,Geist,system-ui,sans-serif] ${
                                        isActive
                                            ? "bg-[#e5effa] border-l-4 border-y-0 border-r-0 border-blue-900 hover:bg-[#e5effa]"
                                            : "bg-transparent border-transparent "
                                    }`}
                                >
                                    {item.icon && (
                                        <span className={`flex items-center justify-center w-4 h-4 shrink-0 transition-colors  ${isActive ? "text-[#1e3a8a]" : "text-[#8892a4]"}`}>
                                            <item.icon />
                                        </span>
                                    )}
                                    <span className={`text-[13.5px] leading-none tracking-[-0.01em] ${isActive ? "text-[#1e3a8a] font-semibold" : "text-[#1a2440] font-[450]"}`}>
                                        {item.title}
                                    </span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
};

export default SidebarContents;