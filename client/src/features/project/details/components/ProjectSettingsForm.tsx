import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useProjectDetails } from "../hooks/useProjectDetails";
import { useUpdateProject } from "../hooks/useUpdateProject";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Loader2, ArrowLeft } from "lucide-react";

const updateProjectSchema = z.object({
    name: z.string().min(1, "Project name is required"),
    address: z.string().min(1, "Address is required"),
    estimatedBudget: z.coerce.number().min(0, "Budget cannot be negative"),
    status: z.enum(["DRAFT", "ACTIVE", "COMPLETED", "ARCHIVED"]),
});

type UpdateProjectFormValues = z.infer<typeof updateProjectSchema>;

const GRID = {
    p: "p-6",
    gap: "gap-6",
    gapSm: "gap-2",
    radius: "rounded-sm",
};

export default function ProjectSettingsForm() {
    const { orgSlug, projectSlug } = useParams<{
        orgSlug: string;
        projectSlug: string;
    }>();
    const navigate = useNavigate();

    const {
        data: project,
        isLoading: isFetching,
        isError,
    } = useProjectDetails(orgSlug, projectSlug);

    const { mutate: updateProject, isPending: isUpdating } = useUpdateProject(
        orgSlug as string,
        projectSlug as string,
    );

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isDirty },
    } = useForm<UpdateProjectFormValues>({
        resolver: zodResolver(updateProjectSchema),
        defaultValues: {
            name: "",
            address: "",
            estimatedBudget: 0,
            status: "DRAFT",
        },
    });

    useEffect(() => {
        if (project) {
            reset({
                name: project.name,
                address: project.address,
                estimatedBudget: project.budgets.estimatedTotal,
                status: project.status,
            });
        }
    }, [project, reset]);

    const onSubmit = (data: UpdateProjectFormValues) => {
        updateProject(data, {
            onSuccess: () => {
                navigate(`/${orgSlug}/${projectSlug}`);
            },
        });
    };

    if (isFetching) {
        return (
            <div className="flex justify-center items-center h-[60vh] font-sans text-slate-500">
                Loading project settings...
            </div>
        );
    }

    if (isError || !project) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] font-sans text-slate-500">
                <AlertTriangle className="h-10 w-10 text-red-500 mb-4" />
                <p className="text-lg font-medium text-slate-900">
                    Failed to load project details
                </p>
            </div>
        );
    }


    return (
        <div className={`max-w-3xl mx-auto ${GRID.p} font-sans`}>
            
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-8"
            >
                <ArrowLeft className="w-4 h-4" />
                Back
            </button>

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-4xl font-display text-slate-900 tracking-tight">
                    Project Settings
                </h1>
                <p className="text-sm text-slate-500 mt-2">
                    Update core configuration and financial baselines.
                </p>
            </div>

            {/* Top Border Section (replaces box) */}
            <div className="border-t border-slate-200/60 pt-6 mt-6">
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className={`flex flex-col ${GRID.gap}`}
                >
                    {/* Project Name */}
                    <div className={`flex flex-col ${GRID.gapSm}`}>
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                            Project Name
                        </label>
                        <Input
                            {...register("name")}
                            className={`font-sans text-slate-900 border-slate-200 focus-visible:ring-green-700 ${GRID.radius}`}
                        />
                        {errors.name && (
                            <span className="text-xs text-red-500">
                                {errors.name.message}
                            </span>
                        )}
                    </div>

                    {/* Address */}
                    <div className={`flex flex-col ${GRID.gapSm}`}>
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                            Site Address
                        </label>
                        <Input
                            {...register("address")}
                            className={`font-sans text-slate-900 border-slate-200 focus-visible:ring-green-700 ${GRID.radius}`}
                        />
                        {errors.address && (
                            <span className="text-xs text-red-500">
                                {errors.address.message}
                            </span>
                        )}
                    </div>

                    <div className={`grid grid-cols-1 md:grid-cols-2 ${GRID.gap}`}>
                        {/* Budget */}
                        <div className={`flex flex-col ${GRID.gapSm}`}>
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                                Base Contract Value (₹)
                            </label>
                            <Input
                                type="number"
                                {...register("estimatedBudget")}
                                className={`font-mono text-slate-900 border-slate-200 focus-visible:ring-green-700 ${GRID.radius}`}
                            />
                        </div>

                        {/* Status */}
                        <div className={`flex flex-col w-full ${GRID.gapSm}`}>
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                                Operational Status
                            </label>
                            <Controller
                                control={control}
                                name="status"
                                render={({ field }) => (
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <SelectTrigger
                                            className={`w-full font-sans text-slate-900 border-slate-200 focus:ring-green-700 ${GRID.radius}`}
                                        >
                                            <SelectValue placeholder="Select a status" />
                                        </SelectTrigger>
                                        <SelectContent className={`${GRID.radius}`}>
                                            <SelectItem value="ACTIVE">Active</SelectItem>
                                            <SelectItem value="COMPLETED">Completed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4 pt-6 mt-4 border-t border-slate-100">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() =>
                                navigate(`/${orgSlug}/${projectSlug}`)
                            }
                            className="text-slate-600 hover:text-slate-900 text-sm px-6"
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            disabled={!isDirty || isUpdating}
                            className={`bg-green-700 text-white hover:bg-green-800 text-sm px-8 ${GRID.radius}`}
                        >
                            {isUpdating ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </div>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
