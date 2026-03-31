import { UserAvatar } from "@/components/Avatar";
import type { EngineerType } from "@/hooks/useEngineers";
import { createColumnHelper } from "@tanstack/react-table";

const columnHelper = createColumnHelper<EngineerType>();

export const EngineerColumns = [
    columnHelper.accessor("username", {
        header: "Username",
        cell: (info) => {
            const username = info.row.original.username || "A"
            return (
                <div className="flex min-h-12 items-center gap-x-2 px-4 font-sans text-sm">
                    <UserAvatar name={username} image={info.row.original.profileImage} className="w-8 h-8"/>
                    <p className="font-medium text-foreground">{username}</p>
                </div>
            );
        },
    }),

    columnHelper.accessor("email", {
        header: "Email",
        cell: (info) => (
            <div className="flex min-h-12 items-center px-4 font-sans text-sm">
                <p className="text-muted-foreground">{info.getValue()}</p>
            </div>
        ),
    }),
];
