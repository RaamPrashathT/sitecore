import { useGetClientDashboardItems } from "../hooks/useClientDashboardItem";
import { Skeleton } from "@/components/ui/skeleton";
import ClientPayments from "./ClientPayments";
import ClientProjects from "./ClientProjects";
import ClientActivity from "./ClientActivity";

const ClientDashboardMain = () => {
    const { data: dashboardData, isLoading: dashboardLoading } = useGetClientDashboardItems();

    const isInitialLoading = dashboardLoading;

    if (isInitialLoading) {
        return (
            <div className="min-h-screen bg-[#f8f9fa] font-sans">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="mb-8 space-y-2">
                        <Skeleton className="h-10 w-64 rounded-sm" />
                        <Skeleton className="h-4 w-96 rounded-sm" />
                    </div>
                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="flex-1 space-y-8">
                            <Skeleton className="h-48 w-full rounded-sm" />
                            <Skeleton className="h-64 w-full rounded-sm" />
                        </div>
                        <div className="w-full lg:w-1/4">
                            <Skeleton className="h-96 w-full rounded-sm" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
                <p className="font-mono text-xs uppercase tracking-widest text-slate-400">Ledger unavailable.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f9fa] text-slate-800 font-sans selection:bg-emerald-100 selection:text-emerald-900">
            <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">

                {/* Editorial Header */}
                <header className=" pb-4">
                    <h1 className="font-serif text-3xl md:text-4xl text-slate-900 mb-1.5 leading-none tracking-tight">
                        Dashboard
                    </h1>
                </header>

                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Left Column - Primary List */}
                    <div className="w-full lg:w-3/4 flex flex-col gap-8 min-w-0">
                        <ClientPayments payments={dashboardData.pendingPayments} />
                        <ClientActivity projects={dashboardData.projects} />
                    </div>

                    {/* Right Column - Static Sidebar */}
                    <aside className="w-full lg:w-1/4 shrink-0 lg:sticky lg:top-20">
                        <ClientProjects projects={dashboardData.projects} />
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default ClientDashboardMain;