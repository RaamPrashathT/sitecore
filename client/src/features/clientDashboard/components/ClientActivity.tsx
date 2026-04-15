import { Link } from "react-router-dom";
import type { ProjectSummary } from "../hooks/useClientDashboardItem";
import { useMembership } from "@/hooks/useMembership";
import { Spinner } from "@/components/ui/spinner";
import { Activity } from "lucide-react";

interface ClientActivityProps {
    projects: ProjectSummary[];
}

const ClientActivity = ({ projects }: ClientActivityProps) => {
    const { data: membership, isLoading: membershipLoading } = useMembership();

    const recentLogs = projects
        .flatMap((p) =>
            p.recentLogs.map((log) => ({
                projectName: p.name,
                ...log,
            })),
        )
        .sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
        )
        .slice(0, 6);

    if (membershipLoading) return <Spinner />;

    return (
        <section>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-[11px] uppercase tracking-widest text-slate-400 font-mono mb-1">
                        Field Updates
                    </p>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-none">
                        Site Activity
                    </h2>
                </div>
                {recentLogs.length > 0 && (
                    <span className="text-[10px] font-mono font-semibold text-slate-400 tabular-nums">
                        {recentLogs.length} entries
                    </span>
                )}
            </div>

            <div className="rounded-2xl ring-1 ring-slate-200/80 bg-white shadow-sm overflow-hidden">
                {recentLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                        <div className="w-10 h-10 rounded-2xl bg-slate-50 ring-1 ring-slate-200 flex items-center justify-center mb-3">
                            <Activity className="w-5 h-5 text-slate-400" />
                        </div>
                        <p className="text-sm font-semibold text-slate-700">
                            No recent activity
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                            Site logs will appear here as they're added
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {recentLogs.map((log) => (
                            <Link
                                key={log.id}
                                to={`/${membership?.slug}/${log.projectSlug}/progress/${log.phaseSlug}`}
                                className="flex items-start gap-3 px-2 py-3.5 hover:bg-slate-50 transition-colors duration-150 group"
                            >
                                {/* Date stamp */}
                                <div className="shrink-0 text-right w-10 pt-0.5">
                                    <p className="font-mono text-[10px] text-slate-400 uppercase leading-tight">
                                        {new Date(
                                            log.createdAt,
                                        ).toLocaleDateString(undefined, {
                                            month: "short",
                                        })}
                                    </p>
                                    <p className="font-mono text-[13px] font-bold text-slate-600 leading-tight">
                                        {new Date(
                                            log.createdAt,
                                        ).toLocaleDateString(undefined, {
                                            day: "numeric",
                                        })}
                                    </p>
                                </div>
                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-semibold text-slate-900 truncate leading-snug">
                                        {log.title}
                                    </p>
                                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                        <span className="font-medium text-green-700">
                                            {log.projectName}
                                        </span>
                                        <span className="mx-1.5 text-slate-300">
                                            ·
                                        </span>
                                        {log.phaseName}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default ClientActivity;
