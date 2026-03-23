import AdminDashboardMain from "@/features/adminDashboard/components/AdminDashboardMain";
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

    if(membership.role === "ADMIN") return (
        <div className="h-full ">
            <AdminDashboardMain />
        </div>
    )
    else if(membership.role === "ENGINEER") return (
        <div className="h-full ">
            <EngineerDashboard />
        </div>
    )
    else return(
        <div className="h-full ">
            <ClientDashboard />
        </div>
    )
    
};

export default DashboardPage;