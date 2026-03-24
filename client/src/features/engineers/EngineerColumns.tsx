import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { EngineerType } from "@/hooks/useEngineers";
import { createColumnHelper } from "@tanstack/react-table";

const columnHelper = createColumnHelper<EngineerType>();

export const EngineerColumns = [
    columnHelper.accessor("username", {
        header: "Username",
        cell: (info) => {
            const username = info.row.original.username || "A"
            return (
                <div className="font-medium flex items-center h-12 px-4 gap-x-2">
                    <Avatar>
                        <AvatarFallback>
                            {username[0].toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <p>{username}</p>
                </div>
            );
        },
    }),

    columnHelper.accessor("email", {
        header: "Email",
        cell: (info) => (
            <div className="font-medium flex items-center h-12 px-4">
                <p>{info.getValue()}</p>
            </div>
        ),
    }),
];
