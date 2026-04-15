import { useGetClientDashboardItems } from "../hooks/useClientDashboardItem";
import { Skeleton } from "@/components/ui/skeleton";
import ClientPayments from "./ClientPayments";
import ClientProjects from "./ClientProjects";
import ClientActivity from "./ClientActivity";

const ClientDashboardSkeleton = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
            <Skeleton className="h-3 w-32 mb-2" />
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-3.5 w-40 mt-2" />
        </div>
        <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1 space-y-8">
                {/* Payments */}
                <div>
                    <Skeleton className="h-3 w-20 mb-2" />
                    <Skeleton className="h-6 w-36 mb-4" />
                    <div className="flex flex-col gap-3">
                        <Skeleton className="h-36 w-full rounded-2xl" />
                        <Skeleton className="h-36 w-full rounded-2xl" />
                    </div>
                </div>
                {/* Activity */}
                <div>
                    <Skeleton className="h-3 w-24 mb-2" />
                    <Skeleton className="h-6 w-32 mb-4" />
                    <Skeleton className="h-48 w-full rounded-2xl" />
                </div>
            </div>
            <div className="w-full lg:w-72 shrink-0 space-y-4">
                <Skeleton className="h-3 w-16 mb-2" />
                <Skeleton className="h-6 w-24 mb-4" />
                <Skeleton className="h-28 w-full rounded-2xl" />
                <Skeleton className="h-28 w-full rounded-2xl" />
                <Skeleton className="h-28 w-full rounded-2xl" />
            </div>
        </div>
    </div>
);

const ClientDashboardMain = () => {
    const { data: dashboardData, isLoading } = useGetClientDashboardItems();

    if (isLoading) return <ClientDashboardSkeleton />;

    if (!dashboardData) {
        return (
            <div className="flex items-center justify-center py-20">
                <p className="text-sm text-slate-500">Dashboard unavailable.</p>
            </div>
        );
    }

    const overdueCount = dashboardData.pendingPayments.filter(
        (p) => p.status === "OVERDUE" || p.status === "URGENT",
    ).length;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 pb-12 pt-6">

            {/* ── Page Header ─────────────────────────────────────────── */}
            <div className="mb-8">
                <p className="text-[11px] uppercase tracking-widest text-slate-400 font-mono mb-1.5">
                    Client · Overview
                </p>
                <h1 className="text-[28px] font-bold text-slate-900 tracking-tight font-display leading-none">
                    My Dashboard
                </h1>
                {overdueCount > 0 && (
                    <p className="text-[13px] text-slate-500 mt-1.5">
                        <span className="text-red-600 font-semibold">{overdueCount} payment{overdueCount === 1 ? "" : "s"}</span>
                        {" "}need{overdueCount === 1 ? "s" : ""} immediate attention
                    </p>
                )}
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">

                {/* ── Left: Main content ──────────────────────────────── */}
                <div className="flex-1 min-w-0 flex flex-col gap-10">
                    <ClientPayments payments={dashboardData.pendingPayments} />
                    <ClientActivity projects={dashboardData.projects} />
                </div>

                {/* ── Right: Sidebar ──────────────────────────────────── */}
                <aside className="w-full lg:w-72 shrink-0 lg:sticky lg:top-6">
                    <ClientProjects projects={dashboardData.projects} />
                </aside>

            </div>
        </div>
    );
};

export default ClientDashboardMain;
