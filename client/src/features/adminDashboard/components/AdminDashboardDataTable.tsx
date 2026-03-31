import type { Table } from "@tanstack/react-table";
import type { DashboardItemType } from "../hooks/useGetDashboardItems";
import AdminDashboardCard from "./AdminDashboardCard";

interface AdminDashboardDataTableProps {
    readonly table: Table<DashboardItemType>;
}

const AdminDashboardDataTable = ({ table }: AdminDashboardDataTableProps) => {
    return (
        <div className="flex flex-col gap-4 ">
            {table.getRowModel().rows.map((row) => (
                <AdminDashboardCard key={row.id} row={row} />
            ))}
        </div>
    );
};

export default AdminDashboardDataTable;