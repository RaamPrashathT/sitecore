import AdminDashboardDataTable from "@/features/adminDashboard/components/AdminDashboardDataTable";
import EmptyAdminDashboard from "@/features/adminDashboard/components/EmptyAdminDashboard";
import {
    useGetDashboardItems,
    type DashboardItemType,
} from "@/features/adminDashboard/hooks/useGetDashboardItems";
import { useMembership } from "@/hooks/useMembership";
import { useMemo } from "react";

const DashboardPage = () => {
    const { data: membership, isLoading: membershipLoading } = useMembership();
    const { data: dashboardItems, isLoading: dashboardItemsLoading } =
        useGetDashboardItems(membership?.id);

    const { redZone, yellowZone, greenZone } = useMemo(() => {
        const red: typeof dashboardItems = [];
        const yellow: typeof dashboardItems = [];
        const green: typeof dashboardItems = [];

        if (!dashboardItems)
            return { redZone: red, yellowZone: yellow, greenZone: green };

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        dashboardItems.forEach((item) => {
            const startDate = new Date(item.phaseStartDate);
            const dropDeadDate = new Date(startDate);
            dropDeadDate.setDate(dropDeadDate.getDate() - item.leadTime);

            const diffTime = dropDeadDate.getTime() - today.getTime();
            const diffDate = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDate <= 3) {
                red.push(item);
            } else if (diffDate <= 7) {
                yellow.push(item);
            } else {
                green.push(item);
            }
        });

        const sortBySupplier = (a: DashboardItemType, b: DashboardItemType) => {
            return (a.supplierName || "").localeCompare(b.supplierName || "");
        };

        return {
            redZone: red.sort(sortBySupplier),
            yellowZone: yellow.sort(sortBySupplier),
            greenZone: green.sort(sortBySupplier),
        };
    }, [dashboardItems]);

    if (membershipLoading || dashboardItemsLoading)
        return <div>Loading...</div>;
    if (!membership || !dashboardItems) return <div>No access</div>;

    const allEmpty = redZone.length === 0 && yellowZone.length === 0 && greenZone.length === 0;

    if (allEmpty) return <EmptyAdminDashboard />;

    return (
        <div className="flex flex-col gap-y-2">
            {redZone.length > 0 && (
                <div className="py-4 flex flex-col gap-y-2">
                    <h1 className="text-2xl font-semibold pl-2 text-destructive">Immediate action required</h1>
                    <AdminDashboardDataTable data={redZone} />
                </div>
            )}
            {yellowZone.length > 0 && (
                <div className="py-4 flex flex-col gap-y-2">
                    <h1 className="text-2xl font-semibold pl-2 text-yellow-500">Due soon</h1>
                    <AdminDashboardDataTable data={yellowZone} />
                </div>
            )}
            {greenZone.length > 0 && (
                <div className="py-4 flex flex-col gap-y-2">
                    <h1 className="text-2xl font-semibold pl-2 text-green-700">Upcoming</h1>
                    <AdminDashboardDataTable data={greenZone} />
                </div>
            )}
        </div>
    );
};

export default DashboardPage;