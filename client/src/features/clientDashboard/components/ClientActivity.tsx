import type { ProjectSummary } from "../hooks/useClientDashboardItem";
import { Activity } from "lucide-react";

interface ClientActivityProps {
    projects: ProjectSummary[];
}

const ClientActivity = ({ projects }: ClientActivityProps) => {
    const recentLogs = projects
        .filter((p) => p.latestLog !== null)
        .map((p) => ({
            projectName: p.name,
            phaseName: p.activePhase?.name || "General",
            ...p.latestLog!,
        }))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 6);

    return (
        <section>
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <h2 className="text-base font-semibold text-zinc-900 tracking-tight">
                    Recent Site Activity
                </h2>
                {recentLogs.length > 0 && (
                    <span className="text-[10px] font-mono font-semibold text-zinc-500 bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded-full">
                        {recentLogs.length}
                    </span>
                )}
            </div>

            {/* Card */}
            <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
                {recentLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center mb-3">
                            <Activity className="w-4 h-4 text-zinc-400" />
                        </div>
                        <p className="text-sm font-medium text-zinc-500">No recent activity</p>
                        <p className="text-xs text-zinc-400 mt-1">Site logs will appear here as work progresses.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-zinc-100">
                        {recentLogs.map((log) => (
                            <div
                                key={log.id}
                                className="flex items-start gap-4 px-4 py-3.5 hover:bg-zinc-50/70 transition-colors"
                            >
                                {/* Date stamp */}
                                <div className="font-mono text-[10px] text-zinc-400 uppercase tracking-tight pt-0.5 shrink-0 w-12 text-right leading-tight">
                                    {new Date(log.createdAt).toLocaleDateString(undefined, {
                                        month: "short",
                                        day: "numeric",
                                    })}
                                </div>

                                {/* Dot */}
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-700 shrink-0" />

                                {/* Content */}
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-zinc-800 truncate leading-tight">
                                        {log.title}
                                    </p>
                                    <p className="text-xs text-zinc-400 mt-0.5 truncate">
                                        <span className="font-medium text-zinc-500">{log.projectName}</span>
                                        <span className="mx-1.5 text-zinc-300">·</span>
                                        {log.phaseName}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default ClientActivity;