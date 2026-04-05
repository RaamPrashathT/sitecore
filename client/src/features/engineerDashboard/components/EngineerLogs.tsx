import type { RecentLog } from "../hooks/useEngineerDashboardItem";
import { MessageSquare } from "lucide-react";

interface EngineerLogsProps {
    logs: RecentLog[];
}

const EngineerLogs = ({ logs }: EngineerLogsProps) => {
    return (
        <section className="bg-muted/30 rounded-xl p-6 sm:p-8 border border-border/50">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold tracking-tight text-foreground">Recent Site Logs & Feedback</h2>
            </div>
            
            <div className="space-y-0">
                {logs.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No recent logs recorded.</p>
                ) : (
                    logs.map((log, index) => (
                        <div key={log.id} className={`group flex flex-col gap-3 py-6 px-2 sm:px-4 -mx-2 sm:-mx-4 transition-colors ${index !== logs.length - 1 ? 'border-b border-border/50' : ''}`}>
                            <div className="flex items-start gap-4 sm:gap-6">
                                <div className="font-mono text-[10px] text-muted-foreground font-medium pt-1 shrink-0 uppercase tracking-tighter w-16 text-right">
                                    {new Date(log.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </div>
                                <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0 shadow-[0_0_8px_hsl(var(--primary))]" />
                                <div className="space-y-1 min-w-0 flex-1">
                                    <p className="text-sm font-bold text-foreground truncate">{log.title}</p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        <span className="font-semibold text-foreground/80">{log.projectName}</span> • {log.phaseName}
                                    </p>
                                </div>
                            </div>

                            {/* Render Comments if they exist */}
                            {log.comments && log.comments.length > 0 && (
                                <div className="ml-[5.5rem] mt-2 space-y-2">
                                    {log.comments.map((comment) => (
                                        <div key={comment.id} className="bg-background border border-border/60 p-3 rounded-lg flex items-start gap-3">
                                            <MessageSquare className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                                            <div className="space-y-1 flex-1">
                                                <p className="text-xs text-foreground leading-relaxed">{comment.text}</p>
                                                <p className="text-[9px] font-mono text-muted-foreground uppercase">
                                                    {new Date(comment.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </section>
    );
};

export default EngineerLogs;