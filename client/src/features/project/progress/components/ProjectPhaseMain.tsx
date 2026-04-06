import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { Plus, AlertCircle, Settings } from "lucide-react";
import { usePhaseDetails } from "../hooks/usePhaseDetails";
import { Button } from "@/components/ui/button";
import SiteLogCard from "./SiteLogCard";
import ProjectPhaseSkeleton from "./ProjectPhaseSkeleton.tsx";
import { useMembership } from "@/hooks/useMembership.ts";

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount);

const ProjectPhaseMain = () => {
    const { data: membership, isLoading: isMembershipLoading } =
        useMembership();
    const navigate = useNavigate();
    const { orgSlug, projectSlug, phaseSlug } = useParams<{
        orgSlug: string;
        projectSlug: string;
        phaseSlug: string;
    }>();

    const {
        data: phase,
        isLoading,
        isError,
    } = usePhaseDetails(orgSlug, projectSlug, phaseSlug);

    if (isLoading || isMembershipLoading) {
        return <ProjectPhaseSkeleton />;
    }

    if (isError || !phase) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-2">
                <AlertCircle className="w-8 h-8 text-stone-400" />
                <p className="text-base font-medium text-stone-700 font-sans">
                    Failed to load phase details
                </p>
            </div>
        );
    }

    const formattedSequence = String(phase.sequenceOrder).padStart(2, "0");
    const formattedStartDate = format(
        new Date(phase.startDate),
        "MMMM dd, yyyy",
    );

    return (
        <main className="max-w-4xl mx-auto px-8 pb-32 pt-8">
            <section className="mb-8">
                <div className="flex justify-between items-center">
                    <div className="flex items-baseline gap-4 mb-2">
                        <span className="font-display text-green-800 text-4xl opacity-40 tracking-tight">
                            {formattedSequence}
                        </span>
                        <h1 className="font-display  text-4xl text-stone-900 tracking-tight">
                            {phase.name}
                        </h1>
                        <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-[10px] font-bold uppercase tracking-widest self-center font-sans">
                            {phase.status.replace("_", " ")} Phase
                        </span>
                    </div>
                    <div>
                        {(membership?.role === "ADMIN" ||
                            membership?.role === "ENGINEER") && (
                            <Button
                                variant={"ghost"}
                                onClick={() => navigate(`update-phase`)}
                                className="flex items-center gap-2 group font-sans text-sm font-semibold uppercase tracking-widest text-green-700  border-transparent transition-all pb-1 hover:border hover:text-green-900 hover:bg-green-50 hover:border-green-700"
                            >
                                <Settings className="w-4 h-4" />
                                Settings
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mt-8 py-6 border-y border-stone-200">
                    <div>
                        <label className="block text-[10px] uppercase tracking-widest text-stone-500 mb-2 font-sans font-semibold">
                            Commencement
                        </label>
                        <p className="text-lg font-medium font-sans text-stone-900">
                            {formattedStartDate}
                        </p>
                    </div>
                    <div>
                        <label className="block text-[10px] uppercase tracking-widest text-stone-500 mb-2 font-sans font-semibold">
                            Total Budget
                        </label>
                        <p className="text-lg font-medium font-mono text-stone-900">
                            {formatCurrency(phase.financials.budget)}
                        </p>
                    </div>
                    <div>
                        <label className="block text-[10px] uppercase tracking-widest text-stone-500 mb-2 font-sans font-semibold">
                            Total Spent
                        </label>
                        <p className="text-lg font-bold font-mono text-green-700">
                            {formatCurrency(phase.financials.spent)}
                        </p>
                    </div>
                    <div>
                        <label className="block text-[10px] uppercase tracking-widest text-stone-500 mb-2 font-sans font-semibold">
                            Remaining
                        </label>
                        <p className="text-lg font-medium font-mono text-stone-900">
                            {formatCurrency(phase.financials.remaining)}
                        </p>
                    </div>
                </div>

                <div className="flex justify-between items-center mt-6">
                    <div className="flex gap-4 font-display text-3xl">
                        Updates:
                    </div>

                    {(phase.status === "ACTIVE" && (membership?.role === "ADMIN" || membership?.role === "ENGINEER")) && (
                        <>
                            <Button
                                variant={"ghost"}
                                onClick={() => navigate(`create-log`)}
                                className="flex items-center gap-2 group font-sans text-sm font-semibold uppercase tracking-widest text-green-700  border-transparent transition-all pb-1 hover:border hover:text-green-900 hover:bg-green-50 hover:border-green-700"
                            >
                                <Plus className="w-4 h-4" />
                                Add Update
                            </Button>
                        </>
                    )}
                </div>
            </section>
            <div className="space-y-24 relative min-h-[400px] ">
                {/* Continuous vertical line (Architectural Spine) */}
                {phase.siteLogs.length > 0 && (
                    <div className="absolute left-0 top-0 bottom-0 w-px bg-stone-200 hidden md:block"></div>
                )}

                {/* Map over the logs */}
                {phase.siteLogs.length > 0 ? (
                    phase.siteLogs.map((log) => (
                        <SiteLogCard key={log.id} log={log} />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-stone-400 font-sans">
                        <p className="italic text-sm">
                            No activity logs recorded yet.
                        </p>
                        <p className="text-xs mt-1">
                            Click "Add Update" to create the first log for this
                            phase.
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
};

export default ProjectPhaseMain;
