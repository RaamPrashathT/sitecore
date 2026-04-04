import { flexRender } from "@tanstack/react-table";
import type { Table as ReactTableType } from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { CatalogueWithQuotes } from "@/features/project/requisition/hooks/useGetRequisitionCatalogue";

interface RequisitionTableProps {
    table: ReactTableType<CatalogueWithQuotes>;
}

const RequisitionTable = ({ table }: RequisitionTableProps) => {
    return (
        <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
            <Table className="w-full text-left border-collapse">
                <TableHeader className="bg-slate-50 border-b border-slate-200">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id} className="border-none hover:bg-transparent">
                            {headerGroup.headers.map((header) => (
                                <TableHead
                                    key={header.id}
                                    className="py-4 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500"
                                >
                                    {flexRender(
                                        header.column.columnDef.header,
                                        header.getContext(),
                                    )}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody className="divide-y divide-slate-200">
                    {table.getRowModel().rows.map((row) => (
                        <TableRow
                            key={row.id}
                            className="p-0 hover:bg-slate-50/50 transition-colors border-none"
                        >
                            {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id} className="p-0 align-top">
                                    {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext(),
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default RequisitionTable;