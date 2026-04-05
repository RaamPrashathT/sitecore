import type { Table } from "@tanstack/react-table";
import type { DashboardItemType } from "../hooks/useGetDashboardItems";
import AdminDashboardCard from "./AdminDashboardCard";

interface AdminDashboardDataTableProps {
    readonly table: Table<DashboardItemType>;
}

const AdminDashboardDataTable = ({ table }: AdminDashboardDataTableProps) => {
    const rows = table.getRowModel().rows;

    if (rows.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <p className="text-sm">No items to display</p>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-4">
            {rows.map((row) => (
                <AdminDashboardCard key={row.id} row={row} />
            ))}
        </div>
    );
};

export default AdminDashboardDataTable;