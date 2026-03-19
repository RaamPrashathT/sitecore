import { useMembership } from "@/hooks/useMembership";
import { useGetDashboardItems } from "../hooks/useGetDashboardItems";
import AdminDashboardDataTable from "./AdminDashboardDataTable";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useState } from "react";
import { columns } from "./AdminDashboardColumns";
import OrderButton from "./OrderButton";
import SearchTableControl from "./SearchTableControl";

const AdminDashboardMain = () => {
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [globalFilter, setGlobalFilter] = useState("");
    const { data: membership, isLoading: membershipLoading } = useMembership();
    const { data: dashboardItems, isLoading: dashboardItemsLoading } =
        useGetDashboardItems(membership?.id, pagination.pageIndex, pagination.pageSize);

    const table = useReactTable({
        data: dashboardItems?.data ?? [],
        rowCount: dashboardItems?.count ?? 0,
        columns,  
        getCoreRowModel: getCoreRowModel(),
        onPaginationChange: setPagination,
        manualPagination: true,
        state: {
            pagination,
            globalFilter,
        }
    })

    if (membershipLoading || dashboardItemsLoading)
        return <div>Loading...</div>;
    if (!membership || !dashboardItems) return <div>No access</div>;
    return (
        <div className="px-4">
            <div className="flex flex-row justify-between items-center py-2">
                <OrderButton/>
                <SearchTableControl/>
            </div>
            <div>
                <AdminDashboardDataTable table={table} />
            </div>
            <div className="text-center">
                pagination
            </div>
        </div>
    );
};

export default AdminDashboardMain;
