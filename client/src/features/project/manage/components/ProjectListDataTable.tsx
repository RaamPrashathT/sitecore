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
import type { ProjectListType } from "../hooks/useProjectList";
import { useNavigate } from "react-router-dom";

interface ProjectListDataTableProps {
    table: ReactTableType<ProjectListType>;
    slug: string;
}

const ProjectListDataTable = ({ table, slug }: ProjectListDataTableProps) => {
    const navigate = useNavigate();
    return (
        <div>
            <Table className="">
                <TableHeader className="pl-2">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow
                            key={headerGroup.id}
                            className="p-0 pl-2 bg-slate-100 border-none"
                        >
                            {headerGroup.headers.map((header) => (
                                <TableHead
                                    key={header.id}
                                    className="text-lg p-0 text-md text-gray-600  first:rounded-l-xl first:pl-4 last:rounded-r-xl "
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
                        <TableRow
                            key={row.id}
                            className="p-0 hover:bg-green-50"
                            onClick={() =>
                                navigate(`/${slug}/${row.original.slug}`)
                            }
                        >
                            {row.getVisibleCells().map((cell) => (
                                <TableCell
                                    key={cell.id}
                                    className="p-0  first:rounded-l-xl last:rounded-r-xl first:pl-4"
                                >
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

export default ProjectListDataTable;
