import AdminDashboardMain from "@/features/adminDashboard/components/AdminDashboardMain";
import PendingApprovalsSidebar from "@/features/adminDashboard/components/PendingApprovalsSidebar";
import ClientDashboard from "@/features/clientDashboard/components/ClientDashboardMain";
import EngineerDashboard from "@/features/engineerDashboard/components/EngineerDashboardMain";
import { useMembership } from "@/hooks/useMembership";

const DashboardPage = () => {
    const { data: membership, isLoading } = useMembership();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!membership) {
        return <div>No access</div>;
    }

    if (membership.role === "ADMIN") {
        return (
            <div className="h-full w-full max-w-[1600px] mx-auto py-4 sm:pl-4 no-scrollbar">
                {/* The 12-column grid that handles the 70/30 split */}
                <div className="grid grid-cols-12 gap-8 h-full items-start">
                    {/* Left Side (70%) - Materials to Fulfill */}
                    <AdminDashboardMain />

                    {/* Right Side (30%) - Pending Approvals */}
                    <PendingApprovalsSidebar />
                </div>
            </div>
        );
    } else if (membership.role === "ENGINEER")
        return (
            <div className="h-full ">
                <EngineerDashboard />
            </div>
        );
    else
        return (
            <div className="h-full ">
                <ClientDashboard />
            </div>
        );
};

export default DashboardPage;
