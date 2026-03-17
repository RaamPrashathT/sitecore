import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { columns } from "./columns";
import {
    Table,
    TableBody,
    //   TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { PendingRequisitionListType } from "@/hooks/usePendingRequisitionList";
import { useMembership } from "@/hooks/useMembership";
import { useNavigate } from "react-router-dom";
interface DataTableProps {
    data: PendingRequisitionListType[];
}

const DataTable = ({ data }: DataTableProps) => {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    const {data: membership, isLoading: membershipLoading} = useMembership()
    const navigate = useNavigate();
    
    if(membershipLoading) return <div>Loading...</div>
    if(!membership) return <div>No data</div>

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
                <TableBody>
                    {table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id} onClick={() => navigate(`${row.original.id}`)}>
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

export default DataTable;