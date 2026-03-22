
import { EngineerColumns as columns } from "./EngineerDashboardItemColumn";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import EngineerDashboardItemTable from "./EngineerDashboardItemTable";
import type { EngineerDashboardItem } from "../hooks/useEngineerDashboardItem";

interface EngineerDashboardItemProps {
    dashboardItems: EngineerDashboardItem[];
}


const EngineerDashboardItemMain = ({ dashboardItems } :EngineerDashboardItemProps ) => {

    const table = useReactTable({
        data: dashboardItems,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="px-4">
            <div>
                <EngineerDashboardItemTable table={table} />
            </div>
        </div>
    );
};

export default EngineerDashboardItemMain;
