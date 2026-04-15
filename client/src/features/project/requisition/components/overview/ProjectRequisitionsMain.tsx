import { useParams } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";
import { useProjectRequisitions } from "../../hooks/useProjectRequisitions";
import PhaseRequisitionsSection from "./PhaseRequisitionsSection";

export default function ProjectRequisitionsMain() {
    const { orgSlug, projectSlug } = useParams<{
        orgSlug: string;
        projectSlug: string;
    }>();

    const {
        data: phases,
        isLoading,
        isError,
    } = useProjectRequisitions(orgSlug, projectSlug);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-stone-50">
                <Loader2 className="w-8 h-8 animate-spin text-green-700" />
            </div>
        );
    }

    if (isError || !phases) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-stone-50 text-stone-500">
                <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
                <p className="font-medium font-sans text-stone-900 text-lg">
                    Failed to load requisitions.
                </p>
                <p className="text-sm font-sans">Please check your connection and try again.</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-stone-50 px-6 font-sans">
            <div className="max-w-4xl mx-auto">
                
                {/* Editorial Header */}
                <header className=" py-4">
                    <div className="flex flex-col">
                        <h1 className="font-display text-4xl tracking-tight text-stone-900">
                            Requisitions
                        </h1>
                        <p className="font-sans text-sm text-stone-500 tracking-wide mt-1">
                            Procurement & Material Management
                        </p>
                    </div>
                </header>

                {/* Phase Iteration */}
                {phases.length > 0 ? (
                    phases.map((phase, index) => (
                        <PhaseRequisitionsSection
                            key={phase.id}
                            phase={phase}
                            index={index}
                            orgSlug={orgSlug!}
                            projectSlug={projectSlug!}
                        />
                    ))
                ) : (
                    <div className="text-center py-32">
                        <p className="text-stone-500 font-sans italic">
                            No phases have been created for this project yet.
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}