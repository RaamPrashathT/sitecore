import { useNavigate, useParams } from "react-router-dom";
import { useProjectProgress } from "../hooks/useProjectProgress";
import { Loader2, AlertCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import PhaseCard from "./PhaseCard";

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount);

const ProjectProgressMain = () => {
    const navigate = useNavigate();
    const { orgSlug, projectSlug } = useParams<{
        orgSlug: string;
        projectSlug: string;
    }>();

    const { data, isLoading, isError } = useProjectProgress(
        orgSlug,
        projectSlug,
    );

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-green-700" />
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-2">
                <AlertCircle className="w-8 h-8 text-stone-400" />
                <p className="text-base font-medium text-stone-700 font-sans">
                    Failed to load project progress
                </p>
                <p className="text-sm text-stone-500 font-sans">
                    Please try refreshing the page.
                </p>
            </div>
        );
    }

    const { project, phases } = data;

    const formattedActivePhases =
        project.activePhasesCount < 10
            ? `0${project.activePhasesCount}`
            : project.activePhasesCount;

    return (
        <main className="max-w-4xl mx-auto px-8 pb-32 pt-8">
            <section className="mb-8">
                <h1 className="font-display text-4xl text-stone-900 leading-tight tracking-tight">
                    Project Progress
                </h1>

                <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-8 sm:gap-0">
                    <div className="flex gap-12">
                        <div>
                            <p className="font-sans text-xs uppercase tracking-widest text-stone-400 font-semibold mb-1">
                                Total Budget Spent
                            </p>
                            <p className="font-mono text-3xl text-green-700">
                                {formatCurrency(project.totalSpent)}
                            </p>
                        </div>
                        <div>
                            <p className="font-sans text-xs uppercase tracking-widest text-stone-400 font-semibold mb-1">
                                Active Phases
                            </p>
                            <p className="font-mono text-3xl text-stone-900">
                                {formattedActivePhases}
                            </p>
                        </div>
                    </div>

                    <Button
                        variant={"ghost"}
                        onClick={() => navigate(`create-phase`)}
                        className="flex items-center gap-2 group font-sans text-sm font-semibold uppercase tracking-widest text-green-700  border-transparent transition-all pb-1 hover:border hover:text-green-900 hover:bg-green-50 hover:border-green-700"
                    >
                        <Plus className="w-4 h-4" />
                        Create Phase
                    </Button>
                </div>
            </section>

            <div className="relative pl-12 space-y-24">
                <div className="absolute left-[11px] top-0 bottom-0 w-px bg-stone-300 opacity-50"></div>

                {phases.map((phase) => (
                    <PhaseCard key={phase.id} phase={phase} />
                ))}
            </div>
        </main>
    );
};

export default ProjectProgressMain;
