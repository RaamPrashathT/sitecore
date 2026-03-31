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
                <div className="flex min-h-12 items-center gap-x-2 px-4 font-sans text-sm">
                    <Avatar className="size-8">
                        <AvatarFallback className="bg-green-50 font-mono text-xs text-green-700">
                            {username[0].toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
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
