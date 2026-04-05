import { useMembership } from "@/hooks/useMembership";
import { useGetClientDashboardItems } from "../hooks/useClientDashboardItem";
import { Skeleton } from "@/components/ui/skeleton";
import ClientPayments from "./ClientPayments";
import ClientProjects from "./ClientProjects";
import ClientActivity from "./ClientActivity";

const ClientDashboardMain = () => {
    const { data: membership, isLoading: membershipLoading } = useMembership();
    const { data: dashboardData, isLoading: dashboardLoading } = useGetClientDashboardItems();

    const isInitialLoading = membershipLoading || dashboardLoading;

    if (isInitialLoading) {
        return (
            <div className=" bg-zinc-50/60">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-8">
                        <Skeleton className="h-6 w-32 mb-2" />
                        <Skeleton className="h-4 w-56" />
                    </div>
                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="flex-1 space-y-6">
                            <Skeleton className="h-48 w-full rounded-xl" />
                            <Skeleton className="h-80 w-full rounded-xl" />
                        </div>
                        <div className="w-full lg:w-[340px] shrink-0 space-y-4">
                            <Skeleton className="h-64 w-full rounded-xl" />
                            <Skeleton className="h-48 w-full rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!membership || !dashboardData) {
        return (
            <div className="min-h-screen bg-zinc-50/60 flex items-center justify-center">
                <p className="text-sm text-zinc-400">No access or data available.</p>
            </div>
        );
    }

    return (
        <div className="h-full bg-zinc-50/60">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Page header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                        Overview
                    </h1>
                    <p className="text-sm text-zinc-500 mt-1">
                        Your projects, payments, and site activity.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">

                    {/* Left column */}
                    <div className="w-full lg:flex-1 min-w-0 flex flex-col gap-6">
                        <ClientPayments payments={dashboardData.pendingPayments} />
                        <ClientActivity projects={dashboardData.projects} />
                    </div>

                    {/* Right column — sticky sidebar */}
                    <div className="w-full lg:w-[340px] xl:w-[360px] shrink-0 lg:sticky lg:top-8">
                        <ClientProjects projects={dashboardData.projects} />
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ClientDashboardMain;