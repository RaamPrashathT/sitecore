import type { RecentLog } from "../hooks/useEngineerDashboardItem";
import { MessageSquare, ScrollText } from "lucide-react";

interface EngineerLogsProps {
    logs: RecentLog[];
}

const EngineerLogs = ({ logs }: EngineerLogsProps) => {
    return (
        <section>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-[11px] uppercase tracking-widest text-slate-400 font-mono mb-1">
                        Field Updates
                    </p>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-none">
                        Recent Site Logs
                    </h2>
                </div>
                {logs.length > 0 && (
                    <span className="text-[10px] font-mono font-semibold text-slate-400 tabular-nums">
                        {logs.length} entries
                    </span>
                )}
            </div>

            <div className="rounded-2xl ring-1 ring-slate-200/80 bg-white shadow-sm overflow-hidden">
                {logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                        <div className="w-10 h-10 rounded-2xl bg-slate-50 ring-1 ring-slate-200 flex items-center justify-center mb-3">
                            <ScrollText className="w-5 h-5 text-slate-400" />
                        </div>
                        <p className="text-sm font-semibold text-slate-700">No logs recorded</p>
                        <p className="text-xs text-slate-400 mt-1">Site logs will appear here as they're added</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {logs.map((log) => (
                            <div key={log.id} className="p-4 sm:p-5 hover:bg-slate-50/60 transition-colors duration-150">
                                {/* Log header */}
                                <div className="flex items-start gap-3">
                                    {/* Date stamp */}
                                    <div className="shrink-0 text-right w-12 pt-0.5">
                                        <p className="font-mono text-[10px] text-slate-400 uppercase leading-tight">
                                            {new Date(log.createdAt).toLocaleDateString(undefined, { month: "short" })}
                                        </p>
                                        <p className="font-mono text-[13px] font-bold text-slate-600 leading-tight">
                                            {new Date(log.createdAt).toLocaleDateString(undefined, { day: "numeric" })}
                                        </p>
                                    </div>

                                    {/* Dot connector */}
                                    <div className="flex flex-col items-center pt-1.5 shrink-0">
                                        <div className="w-2 h-2 rounded-full bg-slate-800 ring-2 ring-white ring-offset-1" />
                                        {log.comments && log.comments.length > 0 && (
                                            <div className="w-px flex-1 bg-slate-200 mt-1.5 min-h-[16px]" />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 pb-1">
                                        <p className="font-semibold text-[14px] text-slate-900 leading-snug truncate">
                                            {log.title}
                                        </p>
                                        <p className="text-[12px] text-slate-500 mt-0.5 truncate">
                                            <span className="font-medium text-slate-700">{log.projectName}</span>
                                            <span className="mx-1.5 text-slate-300">·</span>
                                            {log.phaseName}
                                        </p>
                                    </div>
                                </div>

                                {/* Comments */}
                                {log.comments && log.comments.length > 0 && (
                                    <div className="ml-[60px] mt-3 flex flex-col gap-2">
                                        {log.comments.map((comment) => (
                                            <div
                                                key={comment.id}
                                                className="flex items-start gap-2.5 bg-slate-50 rounded-xl px-3.5 py-3 ring-1 ring-slate-200/80"
                                            >
                                                <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[12px] text-slate-700 leading-relaxed">
                                                        {comment.text}
                                                    </p>
                                                    <p className="text-[9px] font-mono text-slate-400 uppercase mt-1">
                                                        {new Date(comment.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default EngineerLogs;
