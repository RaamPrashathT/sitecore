import type { PendingInvitationType } from "../hooks/usePendingInvitations";
import { createColumnHelper } from "@tanstack/react-table";
import ClientAssignButton from "./ClientAssignButton";
import EngineerAssignButton from "./EngineerAssignButton";

const columnHelper = createColumnHelper<PendingInvitationType>();

export const PendingInvitationColumns = [
    columnHelper.accessor("username", {
        header: "Name",
        cell: (info) => (
            <div className="flex h-full min-h-12 items-center font-sans text-sm font-medium text-foreground">
                {info.getValue()}
            </div>
        ),
    }),

    columnHelper.accessor("email", {
        header: "Email",
        cell: (info) => (
            <div className="flex h-full min-h-12 items-center font-sans text-sm text-muted-foreground">
                {info.getValue()}
            </div>
        ),
    }),

    columnHelper.display({
        header: "Assignment",
        cell: ({row}) => (
            <div className="flex h-full min-h-12 flex-row gap-2 items-center">
                <ClientAssignButton userId={row.original.userId}/>
                <EngineerAssignButton userId={row.original.userId}/>
            </div>
        ),
    }),

];
