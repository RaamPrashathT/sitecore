import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { columns } from "./AdminDashboardColumns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { DashboardItemType } from "../hooks/useGetDashboardItems";
import { Button } from "@/components/ui/button";
import { useSetDashboardItems } from "../hooks/useSetDashboardItems";
import { useMembership } from "@/hooks/useMembership";
interface AdminDashboardDataTableProps {
    data: DashboardItemType[];
}
interface AdminDashboardDataTableProps {
    data: DashboardItemType[];
    onSelectionChange?: (selectedItems: DashboardItemType[]) => void;
}

const AdminDashboardDataTable = ({ data }: AdminDashboardDataTableProps) => {
    const { data: membership, isLoading: membershipLoading } = useMembership();
    const { mutate, isPending } = useSetDashboardItems(membership?.id);
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });
    const handleProcessSelected = () => {
        const selectedData = table
            .getFilteredSelectedRowModel()
            .rows.map((row) => row.original);
        const selectedIds = selectedData.map((item) => item.id);
        mutate({ requisitionItemIds: selectedIds });
    };
    if (membershipLoading || isPending) {
        return <div>Loading...</div>;
    }
    if (!membership) {
        return <div>No access</div>;
    }
    return (
        <div>
            <Table>
                <TableHeader className="p-0">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id} className="p-0">
                            {headerGroup.headers.map((header) => (
                                <TableHead
                                    key={header.id}
                                    className="text-lg p-0"
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
            <div className="flex items-center justify-end p-4">
                <Button onClick={handleProcessSelected} className="w-48">
                    Order
                </Button>
            </div>
        </div>
    );
};

export default AdminDashboardDataTable;
