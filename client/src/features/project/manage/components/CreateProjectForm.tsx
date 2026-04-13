import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/lib/axios";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";

interface CreateProjectFormProps {
    readonly slug: string;
}

const formSchema = z.object({
    name: z.string().trim().min(1, "Name is required"),
    address: z.string().trim().min(1, "Address is required"),
    estimatedBudget: z.coerce.number().min(0, "Estimated budget cannot be negative"),
});

type CreateProjectFormSchema = z.infer<typeof formSchema>;

const GRID = { p: "p-6", gap: "gap-6", gapSm: "gap-2", radius: "rounded-lg" };

const CreateProjectForm = ({ slug }: CreateProjectFormProps) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CreateProjectFormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            address: "",
            estimatedBudget: 0,
        }
    });

    const onSubmit = async (data: CreateProjectFormSchema) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.post("/project", data);

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
                    <h1 className="text-4xl font-serif text-stone-900 tracking-tight">Create Project</h1>
                    <p className="text-sm font-sans text-stone-500 mt-2">Establish a new construction site and financial baseline.</p>
                </div>

                <div className={` ${GRID.radius}`}>
                    <form onSubmit={handleSubmit(onSubmit)} className={`flex flex-col ${GRID.gap}`}>
                        
                        {/* Project Name */}
                        <div className={`flex flex-col ${GRID.gapSm}`}>
                            <label className="text-xs font-semibold text-stone-500 uppercase tracking-widest">
                                Project Name
                            </label>
                            <Input
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
                            <label className="text-xs font-semibold text-stone-500 uppercase tracking-widest">
                                Site Address
                            </label>
                            <textarea
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
                            <label className="text-xs font-semibold text-stone-500 uppercase tracking-widest">
                                Base Contract Value (₹)
                            </label>
                            <Input
                                type="number"
                                {...register("estimatedBudget")}
                                placeholder="0"
                                className="font-mono text-stone-900 border-stone-200 focus-visible:ring-green-700"
                            />
                            {errors.estimatedBudget && (
                                <span className="text-xs font-medium text-red-500">{errors.estimatedBudget.message}</span>
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