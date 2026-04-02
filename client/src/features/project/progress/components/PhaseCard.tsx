import { format } from "date-fns";
import type { PhaseProgress } from "../hooks/useProjectProgress";
import { Check, ArrowRight, FileText, MessageSquare, Plus } from "lucide-react";
import { Link } from "react-router-dom";

interface PhaseCardProps {
    phase: PhaseProgress;
}

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount);

const getPhaseStyling = (status: string) => {
    switch (status) {
        case "ACTIVE":
            return {
                articleOpacity: "",
                node: (
                    <div className="w-3 h-3 rounded-full bg-green-700 ring-4 ring-green-100"></div>
                ),
                bigNumber: "text-green-800 opacity-20",
                title: "text-stone-900",
                badgeBg: "bg-green-100",
                badgeText: "text-green-800",
                amount: "text-green-700",
            };
        case "COMPLETED":
            return {
                articleOpacity: "transition-opacity duration-300",
                node: (
                    <div className="w-5 h-5 rounded-full bg-stone-200 flex items-center justify-center">
                        <Check
                            className="w-3 h-3 text-stone-600"
                            strokeWidth={3}
                        />
                    </div>
                ),
                bigNumber: "text-stone-400 opacity-20",
                title: "text-stone-900",
                badgeBg: "bg-stone-200",
                badgeText: "text-stone-600",
                amount: "text-stone-900",
            };
        case "PAYMENT_PENDING":
        case "PLANNING":
        default:
            return {
                articleOpacity: " transition-opacity duration-300",
                node: (
                    <div className="w-3 h-3 rounded-full bg-stone-50 border-2 border-stone-300"></div>
                ),
                bigNumber: "text-stone-400 opacity-20",
                title: "text-stone-900",
                badgeBg: "bg-stone-100",
                badgeText: "text-stone-500",
                amount: "text-stone-400",
            };
    }
};

const PhaseCard = ({ phase }: PhaseCardProps) => {
    const styles = getPhaseStyling(phase.status);
    const formattedSequence = String(phase.sequenceOrder).padStart(2, "0");

    const dateText =
        phase.status === "PLANNING" || phase.status === "PAYMENT_PENDING"
            ? `Estimated ${format(new Date(phase.startDate), "MMM yyyy")}`
            : `Started ${format(new Date(phase.startDate), "MMM dd, yyyy")}`;

    const isPlanningState =
        phase.status === "PLANNING" || phase.status === "PAYMENT_PENDING";

    return (
        <article className={`relative ${styles.articleOpacity}`}>
            <div className="absolute -left-12 top-0 flex items-center justify-center w-6 h-6 z-10 bg-stone-50 rounded-full">
                {styles.node}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                {/* LEFT SIDE: Phase Information */}
                <div className="md:col-span-4">
                    <span
                        className={`font-display text-5xl block mb-2 ${styles.bigNumber}`}
                    >
                        {formattedSequence}
                    </span>

                    <h2 className={`font-display text-4xl ${styles.title}`}>
                        {phase.name}
                    </h2>

                    <div className="mt-4 flex flex-wrap gap-3 items-center">
                        <span
                            className={`${styles.badgeBg} ${styles.badgeText} text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm font-sans`}
                        >
                            {phase.status.replace("_", " ")}
                        </span>
                        <span className="text-stone-500 text-xs font-sans">
                            {dateText}
                        </span>
                    </div>

                    <p
                        className={`mt-6 font-mono text-2xl tracking-tight ${styles.amount}`}
                    >
                        {formatCurrency(phase.budget)}
                    </p>
                </div>

                {/* RIGHT SIDE: Activity Logs & Footer */}
                <div
                    className={`md:col-span-8 rounded-lg ${
                        isPlanningState
                            ? "border border-dashed border-stone-300 bg-transparent flex flex-col items-center justify-center min-h-[200px]"
                            : "bg-white p-8 border border-stone-200 shadow-sm"
                    }`}
                >
                    {isPlanningState ? (
                        /* Empty State for Planning Phases (Button Removed) */
                        <div className="text-center p-8">
                            {phase.description && (
                                <p className="text-sm text-stone-500 font-sans mb-3">
                                    {phase.description}
                                </p>
                            )}
                            <p className="text-xs text-stone-400 italic font-sans">
                                Phase scheduled to begin upon completion of
                                prior requirements.
                            </p>
                        </div>
                    ) : (
                        /* Active/Completed State with Logs */
                        <div className="flex flex-col h-full">
                            {/* 1. Description Section */}
                            {phase.description && (
                                <>
                                    <p className="text-sm text-stone-600 font-sans leading-relaxed mb-6">
                                        {phase.description}
                                    </p>
                                    {/* First Divider: ---- */}
                                    <hr className="border-stone-100 mb-6" />
                                </>
                            )}

                            {/* 2. Latest Activity Header */}
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-sans text-xs uppercase tracking-widest text-stone-500 font-bold">
                                    Latest Activity
                                </h3>
                                {phase.status === "ACTIVE" && (
                                    <button className="text-xs text-green-700 font-bold flex items-center gap-1 hover:underline">
                                        <Plus className="w-3 h-3" /> Add Update
                                    </button>
                                )}
                            </div>

                            {/* 3. Activity Logs List */}
                            <div className="space-y-4 flex-1">
                                {phase.latestActivity.length > 0 ? (
                                    phase.latestActivity.map((log) => (
                                        <div
                                            key={log.id}
                                            className="group cursor-pointer pb-4 last:pb-0 border-b border-stone-100 last:border-0"
                                        >
                                            <p className="text-sm text-stone-800 font-sans group-hover:text-green-700 transition-colors leading-relaxed">
                                                {log.title}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-[10px] text-stone-400 font-medium uppercase tracking-tighter">
                                                    {format(
                                                        new Date(log.workDate),
                                                        "MMM dd",
                                                    )}{" "}
                                                    • {log.authorName}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-stone-400 italic font-sans py-4">
                                        No activity logged yet.
                                    </p>
                                )}
                            </div>

                            {/* 4. Footer Metrics & Actions (Second Divider: ---) */}
                            <div className="mt-8 pt-6 border-t border-stone-100 flex items-center justify-between">
                                {/* Left Side Icons (Counts) */}
                                <div className="flex items-center gap-6 text-stone-400">
                                    <div
                                        className="flex items-center gap-2"
                                        title="Total Logs (Commits)"
                                    >
                                        <FileText className="w-4 h-4" />
                                        <span className="text-xs font-mono font-medium">
                                            {phase.totalLogs}
                                        </span>
                                    </div>
                                    <div
                                        className="flex items-center gap-2"
                                        title="Total Comments"
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        <span className="text-xs font-mono font-medium">
                                            {phase.totalComments}
                                        </span>
                                    </div>
                                </div>

                                <button>
                                    <Link
                                        to={`${phase.slug}`}
                                        className="text-xs font-bold uppercase tracking-widest text-stone-600 hover:text-green-700 transition-colors flex items-center gap-1"
                                    >
                                        View Details{" "}
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
};

export default PhaseCard;
