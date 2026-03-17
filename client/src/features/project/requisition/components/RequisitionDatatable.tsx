/* eslint-disable react-hooks/incompatible-library */
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { RequisitionColumns as columns } from "./requisitionColumns";
import {
    Table,
    TableBody,
    //   TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { CatalogueWithQuotes } from "@/hooks/useGetCatalogs";

interface DataTableProps {
    data: CatalogueWithQuotes[];
}

const RequisitionDataTable = ({ data }: DataTableProps) => {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div>
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map(headerGroup => (
                        <TableRow key={headerGroup.id} className=''>
                            {headerGroup.headers.map(header => (
                                <TableHead key={header.id} className='text-lg'>
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody className='p-0'>
                    {table.getRowModel().rows.map(row => (
                        <TableRow key={row.id} className='p-0'>
                            {row.getVisibleCells().map(cell => (
                                <TableCell key={cell.id} className=' p-0'>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default RequisitionDataTable;