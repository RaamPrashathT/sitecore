import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/lib/axios";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";

interface CreateProjectFormProps {
    readonly orgId: string;
    readonly slug: string;
}

const formSchema = z.object({
    name: z.string().trim().min(1, "Name is required"),
    address: z.string().trim().min(1, "Address is required"),
    estimatedBudget: z.number().min(0, "Estimated budget cannot be negative"),
    phases: z.array(
        z.object({
            name: z.string().trim().min(1, "Phase name is required"),
            description: z.string().optional(),
            budget: z.number().min(0, "Budget cannot be negative"),
            startDate: z.string().min(1, "Start date is required"),
            paymentDeadline: z.string().min(1, "Payment deadline is required"),
        }),
    ),
});

type CreateProjectFormSchema = z.infer<typeof formSchema>;

const GRID = { p: "p-6", gap: "gap-6", gapSm: "gap-2", radius: "rounded-lg" };

const CreateProjectForm = ({ orgId, slug }: CreateProjectFormProps) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<CreateProjectFormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            address: "",
            estimatedBudget: 0,
            phases: [],
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "phases",
    });

    const onSubmit = async (data: CreateProjectFormSchema) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.post("/project", {
                ...data,
                phases: data.phases.map((phase) => ({
                    ...phase,
                    startDate: new Date(phase.startDate).toISOString(),
                    paymentDeadline: new Date(phase.paymentDeadline).toISOString(),
                })),
            }, {
                headers: {
                    "x-tenant-slug": orgId, // Assuming your org interceptor uses this
                },
            });

            // Redirect to the newly created project's dashboard
            navigate(`/${slug}/${response.data.slug}`);
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("An unexpected error occurred.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`min-h-screen bg-stone-50 ${GRID.p} font-sans`}>
            <div className="max-w-3xl mx-auto pt-4">
                
                <button 
                    type="button"
                    onClick={() => navigate(`/${slug}/projects`)} // Adjust back route as needed
                    className="flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-stone-900 mb-6 transition-none"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Projects
                </button>

                <div className="mb-8">
                    <h1 className="text-4xl font-display text-stone-900 tracking-tight">Create Project</h1>
                    <p className="text-sm font-sans text-stone-500 mt-2">Establish a new construction site and financial baseline.</p>
                </div>

                <div className={` ${GRID.radius}`}>
                    <form onSubmit={handleSubmit(onSubmit)} className={`flex flex-col ${GRID.gap}`}>
                        
                        {/* Project Name */}
                        <div className={`flex flex-col ${GRID.gapSm}`}>
                            <label htmlFor="project-name" className="text-xs font-semibold text-stone-500 uppercase tracking-widest">
                                Project Name
                            </label>
                            <Input
                                id="project-name"
                                {...register("name")}
                                placeholder="e.g. Skyline Apartments"
                                className="font-sans text-stone-900 border-stone-200 focus-visible:ring-green-700"
                            />
                            {errors.name && (
                                <span className="text-xs font-medium text-red-500">{errors.name.message}</span>
                            )}
                        </div>

                        {/* Address */}
                        <div className={`flex flex-col ${GRID.gapSm}`}>
                            <label htmlFor="project-address" className="text-xs font-semibold text-stone-500 uppercase tracking-widest">
                                Site Address
                            </label>
                            <textarea
                                id="project-address"
                                {...register("address")}
                                placeholder="Full site address or coordinates"
                                className="flex min-h-[80px] w-full rounded-md border border-stone-200 bg-transparent px-3 py-2 text-sm placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-700 disabled:cursor-not-allowed disabled:opacity-50 font-sans text-stone-900"
                            />
                            {errors.address && (
                                <span className="text-xs font-medium text-red-500">{errors.address.message}</span>
                            )}
                        </div>

                        {/* Estimated Budget */}
                        <div className={`flex flex-col ${GRID.gapSm}`}>
                            <label htmlFor="project-budget" className="text-xs font-semibold text-stone-500 uppercase tracking-widest">
                                Base Contract Value (₹)
                            </label>
                            <Input
                                id="project-budget"
                                type="number"
                                {...register("estimatedBudget", { valueAsNumber: true })}
                                placeholder="0"
                                className="font-mono text-stone-900 border-stone-200 focus-visible:ring-green-700"
                            />
                            {errors.estimatedBudget && (
                                <span className="text-xs font-medium text-red-500">{errors.estimatedBudget.message}</span>
                            )}
                        </div>

                        <div className={`flex flex-col ${GRID.gapSm}`}>
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest">
                                    Add Phases (Optional)
                                </p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => append({
                                        name: "",
                                        description: "",
                                        budget: 0,
                                        startDate: "",
                                        paymentDeadline: "",
                                    })}
                                    className="text-xs font-semibold uppercase tracking-wider"
                                >
                                    Add Phase
                                </Button>
                            </div>

                            {fields.length === 0 ? (
                                <div className="text-sm text-stone-500 border border-stone-200 rounded-md p-3">
                                    No phases added yet.
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="border border-stone-200 rounded-md p-4 bg-white">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-sm font-semibold text-stone-800">Phase {index + 1}</h3>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    onClick={() => remove(index)}
                                                    className="text-xs font-semibold uppercase tracking-wider text-stone-500"
                                                >
                                                    Remove
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="flex flex-col gap-2 md:col-span-2">
                                                    <label htmlFor={`phase-${index}-name`} className="text-xs font-semibold text-stone-500 uppercase tracking-widest">Phase Name</label>
                                                    <Input
                                                        id={`phase-${index}-name`}
                                                        {...register(`phases.${index}.name`)}
                                                        placeholder="e.g. Foundation & Footings"
                                                        className="font-sans text-stone-900 border-stone-200 focus-visible:ring-green-700"
                                                    />
                                                    {errors.phases?.[index]?.name && (
                                                        <span className="text-xs font-medium text-red-500">{errors.phases[index]?.name?.message}</span>
                                                    )}
                                                </div>

                                                <div className="flex flex-col gap-2 md:col-span-2">
                                                    <label htmlFor={`phase-${index}-description`} className="text-xs font-semibold text-stone-500 uppercase tracking-widest">Description (Optional)</label>
                                                    <textarea
                                                        id={`phase-${index}-description`}
                                                        {...register(`phases.${index}.description`)}
                                                        className="flex min-h-[80px] w-full rounded-md border border-stone-200 bg-transparent px-3 py-2 text-sm placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-700 disabled:cursor-not-allowed disabled:opacity-50 font-sans text-stone-900"
                                                        placeholder="Brief overview of the work involved..."
                                                    />
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    <label htmlFor={`phase-${index}-budget`} className="text-xs font-semibold text-stone-500 uppercase tracking-widest">Estimated Budget (₹)</label>
                                                    <Input
                                                        id={`phase-${index}-budget`}
                                                        type="number"
                                                        {...register(`phases.${index}.budget`, { valueAsNumber: true })}
                                                        className="font-mono text-stone-900 border-stone-200 focus-visible:ring-green-700"
                                                    />
                                                    {errors.phases?.[index]?.budget && (
                                                        <span className="text-xs font-medium text-red-500">{errors.phases[index]?.budget?.message}</span>
                                                    )}
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    <label htmlFor={`phase-${index}-start-date`} className="text-xs font-semibold text-stone-500 uppercase tracking-widest">Start Date</label>
                                                    <Input
                                                        id={`phase-${index}-start-date`}
                                                        type="date"
                                                        {...register(`phases.${index}.startDate`)}
                                                        className="font-mono text-stone-900 border-stone-200 focus-visible:ring-green-700"
                                                    />
                                                    {errors.phases?.[index]?.startDate && (
                                                        <span className="text-xs font-medium text-red-500">{errors.phases[index]?.startDate?.message}</span>
                                                    )}
                                                </div>

                                                <div className="flex flex-col gap-2 md:col-span-2">
                                                    <label htmlFor={`phase-${index}-payment-deadline`} className="text-xs font-semibold text-stone-500 uppercase tracking-widest">Payment Deadline</label>
                                                    <Input
                                                        id={`phase-${index}-payment-deadline`}
                                                        type="date"
                                                        {...register(`phases.${index}.paymentDeadline`)}
                                                        className="font-mono text-stone-900 border-stone-200 focus-visible:ring-green-700"
                                                    />
                                                    {errors.phases?.[index]?.paymentDeadline && (
                                                        <span className="text-xs font-medium text-red-500">{errors.phases[index]?.paymentDeadline?.message}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Error State */}
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-100 rounded-md text-sm text-red-600 font-medium">
                                {error}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-4 pt-6 mt-2 border-t border-stone-100">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => navigate(-1)}
                                disabled={isLoading}
                                className="text-xs font-semibold text-stone-500 hover:text-stone-900 uppercase tracking-wider px-6 transition-none"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="bg-green-700 text-white hover:bg-green-800 text-xs font-semibold uppercase tracking-wider px-8 transition-none disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        Creating...
                                    </>
                                ) : (
                                    "Create Project"
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateProjectForm;