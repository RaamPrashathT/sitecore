import {
    flexRender,
} from "@tanstack/react-table";
import type { Table as ReactTableType } from "@tanstack/react-table";
import type { PendingInvitationType } from "../hooks/usePendingInvitations";

interface PendingInvitationTableProps {
    table: ReactTableType<PendingInvitationType>;
}

const PendingInvitationTable = ({ table }: PendingInvitationTableProps) => {
    return (
        <div>
            <div className="">
                <div className="p-0">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <div
                            key={headerGroup.id}
                            className="p-0 bg-slate-100 border-none flex flex-row justify-between h-10 items-center rounded-lg"
                        >
                            {headerGroup.headers.map((header) => (
                                <div
                                    key={header.id}
                                    className="text-lg p-0 text-md text-gray-600  first:rounded-l-xl last:rounded-r-xl first:pl-4 last:pr-8"
                                >
                                    {flexRender(
                                        header.column.columnDef.header,
                                        header.getContext(),
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
                <div className="p-0 ">
                    {table.getRowModel().rows.map((row) => (
                        <div key={row.id} className="flex flex-row justify-between">
                            {row.getVisibleCells().map((cell) => (
                                <div key={cell.id} className="first:rounded-l-xl last:rounded-r-xl last:flex last:justify-end flex-1 item-center flex justify-center first:justify-start first:p-2">
                                    {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext(),
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
            
        </div>
    );
};

export default PendingInvitationTable;