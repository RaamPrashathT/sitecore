import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreatePhase } from "../hooks/usePhase";
import { useProjectDetails } from "@/features/project/details/hooks/useProjectDetails";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";

const createPhaseSchema = z.object({
    name: z.string().min(1, "Phase name is required"),
    description: z.string().optional(),
    budget: z.coerce.number().min(0, "Budget cannot be negative"),
    startDate: z.string().min(1, "Start date is required"),
    paymentDeadline: z.string().min(1, "Payment deadline is required"),
});

type FormValues = z.infer<typeof createPhaseSchema>;

const GRID = { p: "p-6", gap: "gap-6", gapSm: "gap-2", radius: "rounded-lg" };

export default function CreatePhaseForm() {
    const { orgSlug, projectSlug } = useParams<{ orgSlug: string; projectSlug: string }>();
    const navigate = useNavigate();
    const { mutate: createPhase, isPending } = useCreatePhase(orgSlug!, projectSlug!);
    const { data: project, isLoading: isProjectLoading } = useProjectDetails(orgSlug, projectSlug);
    const isProjectActive = project?.status === "ACTIVE";

    const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(createPhaseSchema),
        defaultValues: {
            name: "",
            description: "",
            budget: 0,
            startDate: "",
            paymentDeadline: "",
        },
    });

    const onSubmit = (data: FormValues) => {
        createPhase({
            ...data,
            startDate: new Date(data.startDate).toISOString(),
            paymentDeadline: new Date(data.paymentDeadline).toISOString(),
        }, {
            onSuccess: () => navigate(`/${orgSlug}/${projectSlug}/progress`)
        });
    };

    if (isProjectLoading) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center font-sans text-stone-500">
                Loading project state...
            </div>
        );
    }

    if (project && !isProjectActive) {
        return (
            <div className="min-h-screen bg-stone-50 p-6 font-sans">
                <div className="max-w-3xl mx-auto rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-900">
                    <h1 className="text-2xl font-semibold">Project is not active</h1>
                    <p className="mt-2 text-sm text-amber-800">
                        Phase creation is locked until the project becomes ACTIVE.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen bg-stone-50 ${GRID.p} font-sans`}>
            <div className="max-w-3xl mx-auto">
                
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-stone-900 mb-6 transition-none"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Progress
                </button>

                <div className="mb-8">
                    <h1 className="text-3xl font-serif text-stone-900 tracking-tight">Create New Phase</h1>
                    <p className="text-sm font-sans text-stone-500 mt-2">Add a new milestone to the project pipeline.</p>
                </div>

                <div className={`${GRID.radius}`}>
                    <form onSubmit={handleSubmit(onSubmit)} className={`flex flex-col ${GRID.gap}`}>
                        
                        <div className={`flex flex-col ${GRID.gapSm}`}>
                            <label className="text-xs font-semibold text-stone-500 uppercase tracking-widest">Phase Name</label>
                            <Input 
                                {...register("name")}
                                className="font-sans text-stone-900 border-stone-200 focus-visible:ring-green-700"
                                placeholder="e.g. Foundation & Footings"
                            />
                            {errors.name && <span className="text-xs font-medium text-red-500">{errors.name.message}</span>}
                        </div>

                        <div className={`flex flex-col ${GRID.gapSm}`}>
                            <label className="text-xs font-semibold text-stone-500 uppercase tracking-widest">Description (Optional)</label>
                            <textarea 
                                {...register("description")}
                                className="flex min-h-[80px] w-full rounded-md border border-stone-200 bg-transparent px-3 py-2 text-sm placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Brief overview of the work involved..."
                            />
                        </div>

                        <div className={`flex flex-col ${GRID.gapSm}`}>
                            <label className="text-xs font-semibold text-stone-500 uppercase tracking-widest">Estimated Budget (₹)</label>
                            <Input 
                                type="number"
                                {...register("budget")}
                                className="font-mono text-stone-900 border-stone-200 focus-visible:ring-green-700"
                            />
                            {errors.budget && <span className="text-xs font-medium text-red-500">{errors.budget.message}</span>}
                        </div>

                        <div className={`grid grid-cols-1 md:grid-cols-2 ${GRID.gap}`}>
                            <div className={`flex flex-col ${GRID.gapSm}`}>
                                <label className="text-xs font-semibold text-stone-500 uppercase tracking-widest">Start Date</label>
                                <Input 
                                    type="date"
                                    {...register("startDate")}
                                    className="font-mono text-stone-900 border-stone-200 focus-visible:ring-green-700"
                                />
                                {errors.startDate && <span className="text-xs font-medium text-red-500">{errors.startDate.message}</span>}
                            </div>

                            <div className={`flex flex-col ${GRID.gapSm}`}>
                                <label className="text-xs font-semibold text-stone-500 uppercase tracking-widest">Payment Deadline</label>
                                <Input 
                                    type="date"
                                    {...register("paymentDeadline")}
                                    className="font-mono text-stone-900 border-stone-200 focus-visible:ring-green-700"
                                />
                                {errors.paymentDeadline && <span className="text-xs font-medium text-red-500">{errors.paymentDeadline.message}</span>}
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-4 pt-6 mt-2 border-t border-stone-100">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => navigate(-1)}
                                className="text-xs font-semibold text-stone-500 hover:text-stone-900 uppercase tracking-wider px-6"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="bg-green-700 text-white hover:bg-green-800 text-xs font-semibold uppercase tracking-wider px-8 transition-none"
                            >
                                {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Create Phase
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}