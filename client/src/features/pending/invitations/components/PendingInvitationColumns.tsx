import type { PendingInvitationType } from "../hooks/usePendingInvitations";
import { createColumnHelper } from "@tanstack/react-table";
import ClientAssignButton from "./ClientAssignButton";
import EngineerAssignButton from "./EngineerAssignButton";

const columnHelper = createColumnHelper<PendingInvitationType>();

export const PendingInvitationColumns = [
    columnHelper.accessor("username", {
        header: "Name",
        cell: (info) => (
            <div className="font-medium flex items-center h-12 px-4">
                <p>{info.getValue()}</p>
            </div>
        ),
    }),

    columnHelper.accessor("email", {
        header: "Email",
        cell: (info) => (
            <div className="font-medium flex items-center h-12 px-4">
                <p>{info.getValue()}</p>
            </div>
        ),
    }),

    columnHelper.display({
        header: "Assignment",
        cell: ({row}) => (
            <div className="font-medium flex flex-row gap-x-2 items-center h-12 px-4">
                <ClientAssignButton userId={row.original.userId}/>
                <EngineerAssignButton userId={row.original.userId}/>
            </div>
        ),
    }),

];
