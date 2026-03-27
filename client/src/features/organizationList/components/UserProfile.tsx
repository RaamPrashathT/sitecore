import { BadgeCheck, Bell, LogOut } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/features/auth/hooks/useSession";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getSeededColor } from "@/lib/color-hash";

const UserProfile = () => {
    const { user } = useSession();
    const { mutate: logout } = useLogout();

    if (!user) return null;

    const initials = user.username
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const bgColor = "bg-[" + getSeededColor(user?.username) + "]";
    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2.5 focus:ring-0">
                <div className="flex-1 flex flex-col min-w-0 justify-end">
                    <p className="text-[14px] font-semibold text-[#1a2440] truncate text-right">
                        {user.username}
                    </p>
                    <p className="text-[12px] text-[#8892a4] truncate ">
                        {user.email}
                    </p>
                </div>
                <Avatar size={"lg"}>
                    <AvatarImage src={user.profileImage} alt={user.username} />
                    <AvatarFallback className={`${bgColor}`}>
                        {initials}
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                className="bg-white border border-[#e8eaf0] rounded-md mb-2 shadow-[0_8px_32px_-4px_rgba(30,58,138,0.10),0_2px_8px_-2px_rgba(0,0,0,0.06)] p-1.5 min-w-[220px]"
                side={"bottom"}
                align="end"
                sideOffset={8}
            >
                <DropdownMenuLabel className="flex items-center gap-2.5 px-2.5 py-2 font-normal">
                    <Avatar>
                        <AvatarImage
                            src={user.profileImage}
                            alt={user.username}
                        />
                        <AvatarFallback className={`${bgColor}`}>
                            {initials}
                        </AvatarFallback>
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
                    <DropdownMenuItem className="flex items-center gap-2.5 px-2.5 py-2 rounded-[6px] text-[13px] text-[#1a2440] font-[450] cursor-pointer transition-colors duration-120 hover:bg-[#f0f3f9]">
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
    );
};

export default UserProfile;
