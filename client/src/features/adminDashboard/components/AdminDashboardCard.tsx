import type { DashboardItemType } from "../hooks/useGetDashboardItems";
import type { Row } from "@tanstack/react-table";

type DashboardItemCardProps = {
    row: Row<DashboardItemType>;
};

const AdminDashboardCard = ({ row }: DashboardItemCardProps) => {
    const item = row.original;
    return (
        <div className="border rounded-xl p-4 shadow-sm flex flex-col gap-2">
            <div className="flex justify-between items-center">
                <p className="font-semibold text-lg">{item.itemName}</p>

                <span className="text-sm px-2 py-1 rounded bg-slate-100 capitalize">
                    {item.status.toLowerCase()}
                </span>
            </div>

            <div className="text-sm text-muted-foreground space-y-1">
                <p>Project: {item.projectName}</p>
                <p>Supplier: {item.supplierName}</p>
                <p>
                    Qty: {item.quantity} {item.unit}
                </p>
            </div>

            <div className="flex justify-between items-center mt-2">
                <p className="text-sm font-medium">
                    {item.daysTillOrder} days left
                </p>

                <input
                    type="checkbox"
                    checked={row.getIsSelected()}
                    onChange={() => row.toggleSelected()}
                />
            </div>
        </div>
    );
};

export default AdminDashboardCard;
