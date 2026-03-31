import { BadgeCheck, Bell, ChevronsUpDown, LogOut } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { useSession } from "@/features/auth/hooks/useSession";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getSeededColor } from "@/lib/color-hash";
import { useNavigate } from "react-router-dom";
import { useMembership } from "@/hooks/useMembership";

const SidebarUser = () => {
    const { isMobile } = useSidebar();
    const { user } = useSession();
    const { mutate: logout } = useLogout();
    const navigate = useNavigate();
    const { data: membership, isLoading} = useMembership();
    if (!user) return null;

    const initials = user.username
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const bgColor = "bg-[" + getSeededColor(user?.username) + "]";
    if(isLoading) return <div>Loading...</div>
    return (
        <SidebarMenu className="m-0">
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="flex items-center gap-2.5 w-full px-2.5 py-8 rounded-none border border-transparent bg-transparent cursor-pointer transition-[background,border-color] duration-150 ease-in-out hover:bg-green-50 hover:border-[#e8eaf0]"
                        >
                            <Avatar>
                                <AvatarImage
                                    src={user.profileImage}
                                    alt={user.username}
                                />
                                <AvatarFallback className={`${bgColor}`} >{initials}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 flex flex-col min-w-0">
                                <span className="text-[13px] font-semibold text-[#1a2440] truncate">
                                    {user.username}
                                </span>
                                <span className="text-[11px] text-[#8892a4] truncate mt-px">
                                    {user.email}
                                </span>
                            </div>
                            <ChevronsUpDown className="w-3.5 h-3.5 text-[#b5bcc9] shrink-0" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        className="bg-white border border-[#e8eaf0] rounded-md mb-2 shadow-[0_8px_32px_-4px_rgba(30,58,138,0.10),0_2px_8px_-2px_rgba(0,0,0,0.06)] p-1.5 min-w-[220px]"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={8}
                    >
                        <DropdownMenuLabel className="flex items-center gap-2.5 px-2.5 py-2 font-normal">
                            <Avatar>
                                <AvatarImage
                                    src={user.profileImage}
                                    alt={user.username}
                                />
                                <AvatarFallback className={`${bgColor}`}>{initials}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[13px] font-semibold text-[#1a2440]">
                                    {user.username}
                                </span>
                                <span className="text-[11px] text-[#8892a4] truncate">
                                    {user.email}
                                </span>
                            </div>
                        </DropdownMenuLabel>

                        <DropdownMenuSeparator className="bg-[#e8eaf0] my-1 h-px" />

                        <DropdownMenuGroup>
                            <DropdownMenuItem className="flex items-center gap-2.5 px-2.5 py-2 rounded-[6px] text-[13px] text-[#1a2440] font-[450] cursor-pointer transition-colors duration-120 hover:bg-[#f0f3f9]">
                                <BadgeCheck className="w-3.5 h-3.5 shrink-0 opacity-70" />
                                Account
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center gap-2.5 px-2.5 py-2 rounded-[6px] text-[13px] text-[#1a2440] font-[450] cursor-pointer transition-colors duration-120 hover:bg-[#f0f3f9]"
                                onClick={() => navigate(`/${membership?.slug}/notifications`)}
                            >
                                <Bell className="w-3.5 h-3.5 shrink-0 opacity-70" />
                                Notifications
                            </DropdownMenuItem>
                        </DropdownMenuGroup>

                        <DropdownMenuSeparator className="bg-[#e8eaf0] my-1 h-px" />

                        <DropdownMenuItem
                            className="flex items-center gap-2.5 px-2.5 py-2 rounded-[6px] text-[13px] text-[#dc2626] font-[450] cursor-pointer transition-colors duration-120 hover:bg-[#fef2f2]"
                            onClick={() => logout()}
                        >
                            <LogOut className="w-3.5 h-3.5 shrink-0 opacity-70" />
                            Sign out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
};

export default SidebarUser;
