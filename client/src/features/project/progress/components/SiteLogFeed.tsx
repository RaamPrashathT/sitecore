import { Avatar } from "radix-ui";
import type { PhaseDetailsSchema } from "../hooks/useGetPhaseDetails";
import { UserAvatar } from "@/components/Avatar";

function ImageStrip({ images }: { readonly images: string[] }) {
    if (!images || images.length === 0) return null;

    return (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            {images.map((imgUrl, i) => (
                <div
                    key={i}
                    className="shrink-0 w-28 h-20 rounded-md overflow-hidden bg-slate-100 border border-slate-100"
                >
                    <img
                        src={imgUrl}
                        alt={`Progress view ${i + 1}`}
                        className="w-full h-full object-cover"
                    />
                </div>
            ))}
        </div>
    );
}

export default function SiteLogFeed({
    logs,
}: {
    logs: PhaseDetailsSchema["siteLogs"];
}) {
    if (logs.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center py-16">
                <span className="block text-sm font-semibold text-slate-800 mb-1">
                    No progress logged
                </span>
                <span className="text-slate-400 text-sm">
                    Engineers haven't submitted any site logs for this phase yet.
                </span>
            </div>
        );
    }

    return (
        <div className="py-1">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-6 px-1">
                Site Progress
            </h2>

            <div className="relative">
                {/* timeline rule */}
                <div className="absolute left-4.5 top-0 bottom-0 w-px bg-slate-100 pointer-events-none" />

                {logs.map((log) => (
                    <div
                        key={log.id}
                        className="relative flex items-start gap-4 pb-8 last:pb-0"
                    >
                        <UserAvatar image={log.author.profile} name={log.author.name}/>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between gap-4 mb-1">
                                <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                                    {log.title}
                                </h3>
                                <time className="shrink-0 text-xs text-slate-400 tabular-nums">
                                    {new Date(log.workDate).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                    })}
                                </time>
                            </div>

                            {log.description && (
                                <p className="text-slate-500 text-sm leading-relaxed mb-3">
                                    {log.description}
                                </p>
                            )}

                            {log.images?.length > 0 && (
                                <div className="mb-3">
                                    <ImageStrip images={log.images} />
                                </div>
                            )}

                            {log.commentCount > 0 && (
                                <button className="text-xs font-medium text-slate-400 hover:text-slate-700 transition-colors">
                                    {log.commentCount}{" "}
                                    {log.commentCount === 1 ? "comment" : "comments"}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}