import {
    flexRender,
} from "@tanstack/react-table";
import type { Table as ReactTableType } from "@tanstack/react-table";
import type { PendingRequisitionData } from "../hooks/usePendingRequisition";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import PendingRequisitionItemMain from "./PendingRequisitionItemMain";

interface PendingRequisitionTableProps {
    table: ReactTableType<PendingRequisitionData>;
}

const PendingRequisitionTable = ({ table }: PendingRequisitionTableProps) => {
    
    const hasRows = table.getRowModel().rows.length > 0;

    return (
        <div className="overflow-x-auto">
            <div className="flex border-b border-border/80 bg-muted/40">
                {table.getFlatHeaders().map((header) => {
                    const isExpand = header.id === "expand";
                    return (
                        <div
                            key={header.id}
                            style={isExpand ? { width: 48, flexShrink: 0 } : { flex: 1 }}
                            className="h-12 px-4 flex items-center font-display text-sm font-normal tracking-wide text-foreground first:rounded-tl-lg last:rounded-tr-lg"
                        >
                            {flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                            )}
                        </div>
                    );
                })}
            </div>

            {hasRows ? (
                <Accordion type="single" collapsible className="w-full">
                    {table.getRowModel().rows.map((row) => (
                        <AccordionItem
                            key={row.id}
                            value={row.id}
                            className="border-none"
                        >
                            <AccordionTrigger className="hover:no-underline px-0 py-0 group [&>svg]:hidden border-b border-border/60 transition-colors hover:bg-green-50/70">
                                <div className="flex w-full">
                                    {row.getVisibleCells().map((cell) => {
                                        const isExpand = cell.column.id === "expand";
                                        return (
                                            <div
                                                key={cell.id}
                                                style={isExpand ? { width: 48, flexShrink: 0 } : { flex: 1 }}
                                            >
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </AccordionTrigger>

                            <AccordionContent className="px-4 py-4 bg-muted/20 border-b border-border/60">
                                <PendingRequisitionItemMain pendingRequisitionItems={row.original.items} requisitionId={row.original.id}/>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            ) : (
                <div className="flex items-center justify-center py-16">
                    <PendingRequisitionItemMain pendingRequisitionItems={[]} requisitionId="" />
                </div>
            )}
        </div>
    );
};

export default PendingRequisitionTable;