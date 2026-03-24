import {
    flexRender,
} from "@tanstack/react-table";
import type { Table as ReactTableType } from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { EngineerType } from "@/hooks/useEngineers";

interface EngineerTableProps {
    table: ReactTableType<EngineerType>;
}

const EngineerTable = ({ table }: EngineerTableProps) => {
    return (
        <div>
            <Table className="">
                <TableHeader className="p-0">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow
                            key={headerGroup.id}
                            className="p-0 bg-slate-100 border-none"
                        >
                            {headerGroup.headers.map((header) => (
                                <TableHead
                                    key={header.id}
                                    className="text-lg p-0 text-md text-gray-600  first:rounded-l-xl last:rounded-r-xl first:pl-4"
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
                <TableBody className="p-0">
                    {table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id} className="p-0 hover:bg-green-50">
                            {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id} className="p-0  first:rounded-l-xl last:rounded-r-xl ">
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

export default EngineerTable;