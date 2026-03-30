import type { PhaseTimelineItem } from "../hooks/useGetProjectProgress";

interface ProgressTimelineProps {
    readonly phases: PhaseTimelineItem[];
    readonly selectedPhaseId: string | null;
    readonly onSelectPhase: (id: string) => void;
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
    });
}

export default function ProgressTimeline({
    phases,
    selectedPhaseId,
    onSelectPhase,
}: ProgressTimelineProps) {
    const totalSegments = Math.max(1, phases.length - 1);

    const activeIndex = phases.findIndex(
        (p) => p.status === "ACTIVE" || p.status === "PAYMENT_PENDING"
    );
    const fillPercentage =
        activeIndex === -1
            ? phases.every((p) => p.status === "COMPLETED")
                ? 100
                : 0
            : (activeIndex / totalSegments) * 100;

    return (
        <div className="w-full overflow-x-auto">
            <div className="relative min-w-[480px] px-6">
                <div className="flex justify-between mb-3">
                    {phases.map((phase) => {
                        const isFirst = phases[0].id === phase.id;
                        const isLast = phases[phases.length - 1].id === phase.id;
                        const isActive =
                            phase.status === "ACTIVE" ||
                            phase.status === "PAYMENT_PENDING";
                        const isCompleted = phase.status === "COMPLETED";

                        return (
                            <div
                                key={phase.id}
                                className={`flex flex-col w-0 overflow-visible whitespace-nowrap
                                    ${isFirst ? "items-start" : isLast ? "items-end" : "items-center"}
                                `}
                                style={{ flex: "1 0 0%" }}
                            >
                                <span
                                    className={`text-xs font-medium leading-none
                                        ${isActive ? "text-green-600" :
                                          isCompleted ? "text-slate-500" :
                                          "text-slate-400"}
                                    `}
                                >
                                    {formatDate(phase.startDate)}
                                </span>
                            </div>
                        );
                    })}
                </div>
                <div className="relative h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full">
                    <div
                        className="absolute top-0 left-0 h-full bg-green-700 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${fillPercentage}%` }}
                    />
                    <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 flex justify-between">
                        {phases.map((phase) => {
                            const isSelected = phase.id === selectedPhaseId;
                            const isCompleted = phase.status === "COMPLETED";
                            const isActive =
                                phase.status === "ACTIVE" ||
                                phase.status === "PAYMENT_PENDING";
                            const isPaymentPending =
                                phase.status === "PAYMENT_PENDING";

                            return (
                                <button
                                    key={phase.id}
                                    onClick={() => onSelectPhase(phase.id)}
                                    className="relative z-10 flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 rounded-full"
                                    aria-label={`Select phase: ${phase.name}`}
                                    aria-pressed={isSelected}
                                >
                                    <div
                                        className={`
                                            w-5 h-5 rounded-full border-[2.5px] bg-white dark:bg-slate-900
                                            flex items-center justify-center
                                            transition-all duration-200
                                            ${isCompleted
                                                ? "border-green-700 bg-green-700 dark:bg-green-700"
                                                : isActive
                                                ? "border-green-700"
                                                : "border-slate-300 dark:border-slate-600"}
                                            ${isSelected
                                                ? "ring-[3px] ring-green-100 dark:ring-green-900 scale-110"
                                                : "hover:scale-105"}
                                            ${isPaymentPending ? "border-orange-500" : ""}
                                        `}
                                    >
                                        {isCompleted && (
                                            <svg
                                                className="w-2.5 h-2.5 text-white"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={3.5}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                        )}
                                        {isActive && !isPaymentPending && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-700" />
                                        )}
                                        {isPaymentPending && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex justify-between mt-3">
                    {phases.map((phase) => {
                        const isFirst = phases[0].id === phase.id;
                        const isLast = phases[phases.length - 1].id === phase.id;
                        const isSelected = phase.id === selectedPhaseId;
                        const isActive =
                            phase.status === "ACTIVE" ||
                            phase.status === "PAYMENT_PENDING";
                        const isCompleted = phase.status === "COMPLETED";
                        const isPaymentPending = phase.status === "PAYMENT_PENDING";

                        return (
                            <div
                                key={phase.id}
                                className={`flex flex-col gap-1 w-0 overflow-visible
                                    ${isFirst ? "items-start" : isLast ? "items-end" : "items-center"}
                                `}
                                style={{ flex: "1 0 0%" }}
                            >
                                <span
                                    className={`text-xs font-semibold leading-snug text-center max-w-[90px] transition-colors
                                        ${isFirst ? "text-left" : isLast ? "text-right" : "text-center"}
                                        ${isSelected
                                            ? "text-slate-900 dark:text-slate-50"
                                            : isActive
                                            ? "text-green-700 dark:text-green-400"
                                            : isCompleted
                                            ? "text-slate-600 dark:text-slate-400"
                                            : "text-slate-400 dark:text-slate-500"}
                                    `}
                                >
                                    {phase.name}
                                </span>

                                {isPaymentPending && (
                                    <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded whitespace-nowrap">
                                        Payment due
                                    </span>
                                )}

                                {isActive && !isPaymentPending && (
                                    <span className="text-[9px] font-bold text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded whitespace-nowrap">
                                        In progress
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>

            </div>
        </div>
    );
}