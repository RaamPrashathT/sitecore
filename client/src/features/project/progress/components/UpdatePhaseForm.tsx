import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { usePhaseDetails } from "../hooks/usePhaseDetails";
import { useUpdatePhase } from "../hooks/useUpdatePhase";
import { useProjectDetails } from "@/features/project/details/hooks/useProjectDetails";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const updatePhaseSchema = z.object({
    name: z.string().min(1, "Phase name is required"),
    description: z.string().optional(),
    budget: z
        .number("Budget must be a valid number")
        .min(0, "Budget cannot be negative"),
    startDate: z.string().min(1, "Start date is required"),
    paymentDeadline: z.string().min(1, "Payment deadline is required"),
});

type FormValues = z.infer<typeof updatePhaseSchema>;

export default function UpdatePhaseForm() {
    const { orgSlug, projectSlug, phaseSlug } = useParams<{
        orgSlug: string;
        projectSlug: string;
        phaseSlug: string;
    }>();

    const navigate = useNavigate();

    const {
        data: phase,
        isLoading: isFetching,
        isError,
    } = usePhaseDetails(orgSlug, projectSlug, phaseSlug);
    const { data: project, isLoading: isProjectLoading } = useProjectDetails(orgSlug, projectSlug);
    const isProjectActive = project?.status === "ACTIVE";

    const { mutate: updatePhase, isPending: isUpdating } = useUpdatePhase(
        orgSlug!,
        projectSlug!,
        phaseSlug!,
    );

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isDirty },
    } = useForm<FormValues>({
        resolver: zodResolver(updatePhaseSchema),
    });

    useEffect(() => {
        if (phase) {
            const formatDate = (value: string | Date | null | undefined) => {
                if (!value) return "";
                const d = new Date(value);
                return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
            };

            reset({
                name: phase.name,
                description: phase.description || "",
                budget: phase.financials?.budget || 0,
                startDate: formatDate(phase.startDate),
                paymentDeadline: formatDate(phase.paymentDeadline),
            });
        }
    }, [phase, reset]);

    const onSubmit: SubmitHandler<FormValues> = (data) => {
        updatePhase(
            {
                ...data,
                startDate: new Date(data.startDate).toISOString(),
                paymentDeadline: new Date(data.paymentDeadline).toISOString(),
            },
            {
                onSuccess: () =>
                    navigate(
                        `/${orgSlug}/${projectSlug}/progress/${phaseSlug}`,
                    ),
            },
        );
    };

    if (isFetching) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-stone-50">
                <Loader2 className="w-6 h-6 animate-spin text-green-700" />
            </div>
        );
    }

    if (isError || !phase) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-stone-50 text-stone-500">
                <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
                <p className="font-medium font-sans text-stone-900">
                    Failed to load phase details.
                </p>
            </div>
        );
    }

    if (isProjectLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-stone-50 font-sans text-stone-500">
                Loading project state...
            </div>
        );
    }

    if (project && !isProjectActive) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-stone-50 text-stone-500 px-6 text-center">
                <AlertCircle className="w-8 h-8 text-amber-500 mb-2" />
                <p className="font-medium font-sans text-stone-900">
                    Project is not active.
                </p>
                <p className="mt-2 max-w-md text-sm">
                    Phase updates are locked until the project becomes ACTIVE.
                </p>
            </div>
        );
    }

    // Common styling classes for the inputs to match the editorial look
    const inputClasses =
        "w-full bg-transparent border-0 border-b border-stone-300 py-4 px-0 text-xl focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-green-700 rounded-none shadow-none outline-none transition-all duration-500";
    const labelClasses =
        "block font-sans text-[10px] font-semibold tracking-widest uppercase text-stone-500 mb-2 transition-colors group-focus-within:text-green-700";

    return (
        <div className="max-w-2xl mx-auto mt-8">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-stone-500 hover:text-stone-900  mb-4 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Progress
            </button>

            {/* Editorial Header */}
            <header className="mb-8">
                <h1 className="text-2xl md:text-4xl font-serif text-stone-900 tracking-tight">
                    Update Phase
                </h1>
            </header>

            {/* Form Section */}
            <section>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Phase Name */}
                    <div className="group">
                        <label className={labelClasses} htmlFor="name">
                            Phase Name
                        </label>
                        <Input
                            id="name"
                            {...register("name")}
                            className={`${inputClasses} md:text-xl  text-stone-900`}
                        />
                        {errors.name && (
                            <p className="text-red-500 text-xs mt-2 font-medium">
                                {errors.name.message}
                            </p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="group">
                        <label className={labelClasses} htmlFor="description">
                            Description
                        </label>
                        <Textarea
                            id="description"
                            {...register("description")}
                            rows={4}
                            className={`${inputClasses} font-sans leading-relaxed resize-none min-h-[100px] text-stone-700`}
                            placeholder="Detail the technical specifications and objectives for this phase..."
                        />
                        {errors.description && (
                            <p className="text-red-500 text-xs mt-2 font-medium">
                                {errors.description.message}
                            </p>
                        )}
                    </div>

                    {/* Grid: Budget & Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 ">
                        {/* Budget */}
                        <div className="group ">
                            <label
                                className={labelClasses}
                                htmlFor="paymentDeadline"
                            >
                                Payment Deadline
                            </label>
                            <Input
                                id="paymentDeadline"
                                type="date"
                                {...register("paymentDeadline")}
                                className={`${inputClasses} font-mono text-stone-900`}
                            />
                            {errors.paymentDeadline && (
                                <p className="text-red-500 text-xs mt-2 font-medium">
                                    {errors.paymentDeadline.message}
                                </p>
                            )}
                        </div>

                        {/* Start Date */}
                        <div className="group">
                            <label className={labelClasses} htmlFor="startDate">
                                Start Date
                            </label>
                            <Input
                                id="startDate"
                                type="date"
                                {...register("startDate")}
                                className={`${inputClasses} font-mono text-stone-900`}
                            />
                            {errors.startDate && (
                                <p className="text-red-500 text-xs mt-2 font-medium">
                                    {errors.startDate.message}
                                </p>
                            )}
                        </div>
                        <div className="group col-span-2 mt-6">
                            <label className={labelClasses} htmlFor="budget">
                                Estimated Budget (₹)
                            </label>
                            <Input
                                id="budget"
                                type="number"
                                {...register("budget", {
                                    valueAsNumber: true,
                                })}
                                className={`${inputClasses} font-mono text-stone-900`}
                            />
                            {errors.budget && (
                                <p className="text-red-500 text-xs mt-2 font-medium">
                                    {errors.budget.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-x-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => navigate(-1)}
                            className="text-stone-400  hover:text-stone-900 transition-colors duration-300 font-sans text-xs font-semibold tracking-widest uppercase"
                        >
                            Discard Changes
                        </Button>
                        <Button
                            type="submit"
                            disabled={isUpdating || !isDirty}
                            className=""
                        >
                            <span>Save Changes</span>
                            {isUpdating && (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            )}
                        </Button>
                    </div>
                </form>
            </section>
        </div>
    );
}
