import { useGetEngineerDashboardItems } from "../hooks/useEngineerDashboardItem";
import { Skeleton } from "@/components/ui/skeleton";
import EngineerActions from "./EngineerActions";
import EngineerProjects from "./EngineerProjects";
import EngineerLogs from "./EngineerLogs";

const EngineerDashboardMain = () => {
    const { data: dashboardData, isLoading, error } = useGetEngineerDashboardItems();

    if (isLoading) {
        return (
            <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-8 grid grid-cols-1 md:grid-cols-10 gap-8">
                <div className="md:col-span-6 space-y-8">
                    <Skeleton className="h-64 w-full rounded-xl" />
                    <Skeleton className="h-96 w-full rounded-xl" />
                </div>
                <div className="md:col-span-4 space-y-8">
                    <Skeleton className="h-80 w-full rounded-xl" />
                </div>
            </div>
        );
    }

    if (error || !dashboardData) {
        return <div className="p-8 text-center text-muted-foreground">Unable to load dashboard data.</div>;
    }

    return (
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 pb-12 pt-4">
            
            {/* Header */}
            <div className=" pb-6">
                <h1 className="text-3xl font-display font-semibold tracking-tighter text-foreground">Command Center</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
                
                {/* Left Column: 60% */}
                <div className="lg:col-span-6 space-y-10">
                    <EngineerActions 
                        actionablePhases={dashboardData.actionablePhases} 
                        recentRequisitions={dashboardData.recentRequisitions} 
                    />
                    <EngineerLogs logs={dashboardData.recentLogs} />
                </div>

                {/* Right Column: 40% */}
                <div className="lg:col-span-4 space-y-8">
                    <EngineerProjects projects={dashboardData.activeProjects} />
                </div>

            </div>
        </div>
    );
};

export default EngineerDashboardMain;