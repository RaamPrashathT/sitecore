import { flexRender } from "@tanstack/react-table";
import type { Table as ReactTableType } from "@tanstack/react-table";
import type { PendingRequisitionItemType } from "../hooks/usePendingRequisition";

interface PendingRequisitionItemTableProps {
    table: ReactTableType<PendingRequisitionItemType>;
}

const PendingRequisitionItemTable = ({ table }: PendingRequisitionItemTableProps) => {
    
    return (
        <div className="w-full">
            <div className="flex bg-slate-100 rounded-xl mb-1 px-4">
                {table.getFlatHeaders().map((header) => (
                    <div
                        key={header.id}
                        style={{ flex: 1 }}
                        className="text-md text-gray-600 font-medium h-12 flex items-center"
                    >
                        {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                        )}
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-0">
                {table.getRowModel().rows.map((row) => (
                    <div
                        key={row.id}
                        className="flex rounded-xl hover:bg-green-50 transition-colors"
                    >
                        {row.getVisibleCells().map((cell) => (
                            <div
                                key={cell.id}
                                style={{ flex: 1 }}
                                className="h-12 flex items-center text-sm font-medium first:ml-4 last:mr-4  border-b"
                            >
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
    );
};

export default PendingRequisitionItemTable;