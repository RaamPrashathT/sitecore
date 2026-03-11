import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { flexRender, useReactTable, getCoreRowModel } from "@tanstack/react-table";
import { columns } from "./projectColumn";
import type { ProjectListType } from "@/hooks/useProjectList";
import { useNavigate } from "react-router-dom";

interface DataTableProps {
    readonly data: ProjectListType[];
    readonly orgSlug: string;
}

const ProjectListTable = ({data, orgSlug}: DataTableProps ) => {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });
    const navigate = useNavigate();
    return (
        
        <div>
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <TableHead key={header.id}>
                                    {flexRender(
                                        header.column.columnDef.header,
                                        header.getContext(),
                                    )}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows.map((row) => (
                        <TableRow 
                            key={row.id}
                            onClick={() => navigate(`/${orgSlug}/${row.original.slug}`)}
                        >
                            {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id}>
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

export default ProjectListTable;
