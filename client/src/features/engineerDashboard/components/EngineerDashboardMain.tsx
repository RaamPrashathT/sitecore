import { useGetEngineerDashboardItems } from "../hooks/useEngineerDashboardItem";
import { Skeleton } from "@/components/ui/skeleton";
import EngineerActions from "./EngineerActions";
import EngineerProjects from "./EngineerProjects";
import EngineerLogs from "./EngineerLogs";

const EngineerDashboardSkeleton = () => (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
            <Skeleton className="h-3 w-32 mb-2" />
            <Skeleton className="h-8 w-52" />
            <Skeleton className="h-3.5 w-40 mt-2" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
            <div className="lg:col-span-6 space-y-6">
                {/* Action required cards */}
                <div>
                    <Skeleton className="h-3 w-24 mb-2" />
                    <Skeleton className="h-6 w-40 mb-4" />
                    <Skeleton className="h-24 w-full rounded-2xl" />
                </div>
                {/* Requisitions */}
                <div>
                    <Skeleton className="h-3 w-24 mb-2" />
                    <Skeleton className="h-6 w-40 mb-4" />
                    <div className="flex flex-col gap-3">
                        <Skeleton className="h-20 w-full rounded-2xl" />
                        <Skeleton className="h-20 w-full rounded-2xl" />
                    </div>
                </div>
                {/* Logs */}
                <div>
                    <Skeleton className="h-3 w-24 mb-2" />
                    <Skeleton className="h-6 w-40 mb-4" />
                    <Skeleton className="h-64 w-full rounded-2xl" />
                </div>
            </div>
            <div className="lg:col-span-4 space-y-4">
                <Skeleton className="h-3 w-20 mb-2" />
                <Skeleton className="h-6 w-36 mb-4" />
                <Skeleton className="h-32 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
        </div>
    </div>
);

const EngineerDashboardMain = () => {
    const { data: dashboardData, isLoading, error } = useGetEngineerDashboardItems();

    if (isLoading) return <EngineerDashboardSkeleton />;

    if (error || !dashboardData) {
        return (
            <div className="flex items-center justify-center py-20">
                <p className="text-sm text-slate-500">Unable to load dashboard data.</p>
            </div>
        );
    }

    const urgentCount = dashboardData.actionablePhases.length;

    return (
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 pb-12 pt-6">

            {/* ── Page Header ─────────────────────────────────────────── */}
            <div className="mb-8">
                <p className="text-[11px] uppercase tracking-widest text-slate-400 font-mono mb-1.5">
                    Engineer · Command Center
                </p>
                <h1 className="text-[28px] font-bold text-slate-900 tracking-tight font-display leading-none">
                    My Dashboard
                </h1>
                {urgentCount > 0 && (
                    <p className="text-[13px] text-slate-500 mt-1.5">
                        <span className="text-amber-600 font-semibold">{urgentCount} phase{urgentCount !== 1 ? "s" : ""}</span>
                        {" "}need{urgentCount === 1 ? "s" : ""} a requisition
                    </p>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">

                {/* ── Left: 60% ───────────────────────────────────────── */}
                <div className="lg:col-span-6 space-y-10">
                    <EngineerActions
                        actionablePhases={dashboardData.actionablePhases}
                        recentRequisitions={dashboardData.recentRequisitions}
                    />
                    <EngineerLogs logs={dashboardData.recentLogs} />
                </div>

                {/* ── Right: 40% ──────────────────────────────────────── */}
                <div className="lg:col-span-4">
                    <EngineerProjects projects={dashboardData.activeProjects} />
                </div>

            </div>
        </div>
    );
};

export default EngineerDashboardMain;
