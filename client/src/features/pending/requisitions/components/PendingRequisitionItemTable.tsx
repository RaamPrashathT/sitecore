import { flexRender } from "@tanstack/react-table";
import type { Table as ReactTableType } from "@tanstack/react-table";
import type { PendingRequisitionItemType } from "../hooks/usePendingRequisition";

interface PendingRequisitionItemTableProps {
    table: ReactTableType<PendingRequisitionItemType>;
}

const PendingRequisitionItemTable = ({ table }: PendingRequisitionItemTableProps) => {
    
    return (
        <div className="w-full rounded-lg border border-border/60 bg-background overflow-hidden">
            <div className="flex bg-muted/40 border-b border-border/60 px-4">
                {table.getFlatHeaders().map((header) => (
                    <div
                        key={header.id}
                        style={{ flex: 1 }}
                        className="h-11 flex items-center font-display text-xs font-normal tracking-wide text-foreground"
                    >
                        {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                        )}
                    </div>
                ))}
            </div>

            <div className="flex flex-col">
                {table.getRowModel().rows.map((row, index) => (
                    <div
                        key={row.id}
                        className={`flex transition-colors hover:bg-green-50/50 ${
                            index !== table.getRowModel().rows.length - 1 ? "border-b border-border/40" : ""
                        }`}
                    >
                        {row.getVisibleCells().map((cell) => (
                            <div
                                key={cell.id}
                                style={{ flex: 1 }}
                                className="flex items-center px-4"
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