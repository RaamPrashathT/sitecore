import { flexRender } from "@tanstack/react-table";
import type { Table as ReactTableType } from "@tanstack/react-table";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import type { EngineerDashboardResponse } from "../hooks/useEngineerDashboardItem";
import EngineerDashboardItemMain from "./EngineerDashboardItemMain";

interface EngineerDashboardDataTableProps {
    table: ReactTableType<EngineerDashboardResponse>;
}

const EngineerDashboardDataTable = ({ table }: EngineerDashboardDataTableProps) => {
    return (
        <div>
            <div className="flex bg-slate-100 rounded-xl mb-1">
                {table.getFlatHeaders().map((header) => {
                    const isExpand = header.id === "expand";
                    return (
                        <div
                            key={header.id}
                            style={isExpand ? { width: 48, flexShrink: 0 } : { flex: 1 }}
                            className="text-md text-gray-600 font-medium px-4 h-12 flex items-center"
                        >
                            {flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                            )}
                        </div>
                    );
                })}
            </div>

            <Accordion type="single" collapsible className="w-full">
                {table.getRowModel().rows.map((row) => (
                    <AccordionItem
                        key={row.id}
                        value={row.id}
                        className="border-none mb-1"
                    >
                        <AccordionTrigger className="hover:no-underline px-0 py-0 group [&>svg]:hidden">
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

                        <AccordionContent className="px-4 py-3 ">
                            <EngineerDashboardItemMain dashboardItems={row.original.actionablePhases} />
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
};

export default EngineerDashboardDataTable;