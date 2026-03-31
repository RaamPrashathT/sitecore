import { useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { usePhaseDetails, useUpdatePhase } from "../hooks/usePhase";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
    Field,
    FieldLabel,
    FieldDescription,
    FieldError,
} from "@/components/ui/field";

import { Loader2, ArrowLeft, AlertCircle } from "lucide-react";

const updatePhaseSchema = z.object({
    name: z.string().min(1, "Phase name is required"),
    description: z.string().optional(),
    budget: z.coerce.number().min(0, "Budget cannot be negative"),
    startDate: z.string().min(1, "Start date is required"),
    paymentDeadline: z.string().min(1, "Payment deadline is required"),
});

type FormValues = z.infer<typeof updatePhaseSchema>;

export default function UpdatePhaseForm() {
    const { orgSlug, projectSlug } = useParams<{
        orgSlug: string;
        projectSlug: string;
    }>();

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const phaseId = searchParams.get("phaseId");

    const {
        data: phase,
        isLoading: isFetching,
        isError,
    } = usePhaseDetails(orgSlug, projectSlug, phaseId);

    const { mutate: updatePhase, isPending: isUpdating } = useUpdatePhase(
        orgSlug!,
        projectSlug!,
        phaseId,
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
            const formatDate = (value: any) => {
                if (!value) return "";
                const d = new Date(value);
                return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
            };

            reset({
                name: phase.name,
                description: phase.description || "",
                budget: phase.budget,
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
                    navigate(`/${orgSlug}/${projectSlug}/progress`),
            },
        );
    };

    if (isFetching) {
        return (
            <div className="flex justify-center items-center h-screen bg-stone-50">
                <Loader2 className="w-6 h-6 animate-spin text-green-700" />
            </div>
        );
    }

    if (isError || !phase) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-stone-50 text-stone-500">
                <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
                <p className="font-medium text-stone-900">
                    Failed to load phase details.
                </p>
                <p className="text-sm">
                    Please ensure the Phase ID is correct.
                </p>
            </div>
        );
    }

    const isLocked = phase.status === "ACTIVE" || phase.status === "COMPLETED";

    return (
        <div className="min-h-screen bg-stone-50 p-6 font-sans">
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-stone-900 mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Progress
                </button>
=
                <div className="mb-8 flex items-end justify-between">
                    <div>
                        <h1 className="text-3xl font-display text-stone-900 tracking-tight">
                            Update Phase
                        </h1>
                        <p className="text-sm text-stone-500 mt-2">
                            Modify details for {phase.name}.
                        </p>
                    </div>

                    {isLocked && (
                        <span className="bg-yellow-100 text-yellow-800 border border-yellow-200 text-xs font-semibold px-2 py-1 rounded">
                            {phase.status} — Partially Locked
                        </span>
                    )}
                </div>

                <div className="border-y">
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="flex flex-col gap-6"
                    >
                        <Field>
                            <FieldLabel>Phase Name</FieldLabel>
                            <Input {...register("name")} />
                            <FieldError>{errors.name?.message}</FieldError>
                        </Field>
                        <Field>
                            <FieldLabel>Description</FieldLabel>
                            <Textarea {...register("description")} />
                        </Field>

                        <Field>
                            <FieldLabel>Estimated Budget (₹)</FieldLabel>
                            <Input
                                type="number"
                                {...register("budget")}
                                disabled={isLocked}
                                className="font-mono"
                            />

                            {isLocked && (
                                <FieldDescription>
                                    Budget cannot be changed while active or
                                    completed.
                                </FieldDescription>
                            )}

                            <FieldError>{errors.budget?.message}</FieldError>
                        </Field>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Field>
                                <FieldLabel>Start Date</FieldLabel>
                                <Input
                                    type="date"
                                    {...register("startDate")}
                                    disabled={isLocked}
                                    className="font-mono"
                                />
                                <FieldError>
                                    {errors.startDate?.message}
                                </FieldError>
                            </Field>

                            <Field>
                                <FieldLabel>Payment Deadline</FieldLabel>
                                <Input
                                    type="date"
                                    {...register("paymentDeadline")}
                                    className="font-mono"
                                />
                                <FieldError>
                                    {errors.paymentDeadline?.message}
                                </FieldError>
                            </Field>
                        </div>

                        <div className="flex items-center justify-end gap-4 pt-6 border-t border-stone-100">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => navigate(-1)}
                                className="text-xs uppercase tracking-wider"
                            >
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                disabled={isUpdating || (!isDirty && !isLocked)}
                                className="bg-green-700 hover:bg-green-800 text-white text-xs uppercase tracking-wider"
                            >
                                {isUpdating && (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                )}
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
