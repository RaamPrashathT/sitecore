import { Link } from "react-router-dom";
import type { ProjectSummary } from "../hooks/useClientDashboardItem";
import { useMembership } from "@/hooks/useMembership";
import { Spinner } from "@/components/ui/spinner";

interface ClientActivityProps {
    projects: ProjectSummary[];
}

const ClientActivity = ({ projects }: ClientActivityProps) => {
    const {data: membership, isLoading: membershipLoading} = useMembership()
    const recentLogs = projects
        .flatMap((p) =>
            p.recentLogs.map((log) => ({
                projectName: p.name,
                ...log, // The backend now provides id, title, createdAt, AND phaseName directly in the log object
            })),
        )
        .sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
        )
        .slice(0, 6);

    if(membershipLoading) {
        return <Spinner />
    }
    return (
        <section className="mt-4">
            <div className="flex items-end justify-between mb-2 border-b border-slate-200 pb-2">
                <h2 className="font-serif text-2xl text-slate-900 tracking-tight leading-none">
                    Site Activity
                </h2>
                {recentLogs.length > 0 && (
                    <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-200/50 px-2 py-0.5 rounded-sm">
                        {recentLogs.length} ENTRIES
                    </span>
                )}
            </div>

            <div className="rounded border border-slate-200 bg-white overflow-hidden shadow-sm">
                {recentLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                        <p className="font-sans text-xs font-medium text-slate-400 uppercase tracking-widest">
                            No recent entries
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {recentLogs.map((log) => (
                            <div
                                key={log.id}
                                className="p-3 hover:bg-slate-50 transition-colors cursor-pointer group flex justify-between items-start gap-4"
                            >
                                <Link
                                    to={`/${membership?.slug}/${log.projectSlug}/progress/${log.phaseSlug}`}
                                    className="flex  w-full"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="font-sans text-xs font-bold text-slate-900 truncate mb-0.5">
                                            {log.title}
                                        </p>
                                        <p className="font-sans text-[10px] text-slate-500 truncate">
                                            <span className="font-semibold text-[#006d30]">
                                                {log.projectName}
                                            </span>
                                            <span className="mx-1.5 text-slate-300">
                                                ·
                                            </span>
                                            {log.phaseName}
                                        </p>
                                    </div>
                                    <span className="font-mono text-[9px] uppercase tracking-widest text-slate-400 whitespace-nowrap shrink-0 mt-0.5">
                                        {new Date(
                                            log.createdAt,
                                        ).toLocaleDateString(undefined, {
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </span>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default ClientActivity;
