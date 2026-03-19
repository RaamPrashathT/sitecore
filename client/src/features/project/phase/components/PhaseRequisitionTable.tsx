import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { PhaseItem } from "@/features/project/phase/hooks/usePhaseList";
import { phaseRequisitionColumns } from "./PhaseRequisitionColumns";

interface PhaseRequisitionTableProps {
    data: PhaseItem[];
}

const DataTable = ({ data }: PhaseRequisitionTableProps) => {
    const table = useReactTable({
        data,
        columns: phaseRequisitionColumns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div>
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id} className="">
                            {headerGroup.headers.map((header) => (
                                <TableHead key={header.id} className="text-lg">
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
                        <TableRow key={row.id} className="p-0">
                            {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id} className=" p-0">
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

export default DataTable;
