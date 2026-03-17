import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useMembership } from "@/hooks/useMembership";
import { useProjectDetails } from "@/hooks/useProjectDetails";
import api from "@/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import z from "zod";

const formSchema = z.object({
    name: z.string().trim().min(1, "Name is required"),
    description: z.string().trim().min(1, "Description is required"),
    budget: z.string().min(1, "Budget is required"),
    paymentDeadline: z.date("Invalid date"),
    startDate: z.date("Invalid date"),
});

type CreatePhaseFormSchema = z.infer<typeof formSchema>;

const PhaseCreationForm = () => {
    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<CreatePhaseFormSchema>({
        resolver: zodResolver(formSchema),
    });
    const navigate = useNavigate();
    const { projectSlug } = useParams();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { data: membership, isLoading: membershipLoading } = useMembership();
    const { data: project, isLoading: projectLoading } = useProjectDetails(
        projectSlug,
        membership?.id,
    );

    if (membershipLoading || projectLoading) return <div>Loading...</div>;
    if (!project || !membership || !projectSlug) return <div>No access</div>;
    const onSubmit = async (data: CreatePhaseFormSchema) => {
        setIsLoading(true);
        setError(null);
        try {
            await api.post("/project/phase", data, {
                headers: {
                    "x-organization-id": membership.id,
                    "x-project-id": project.id,
                },
            });
            navigate(`/${membership.slug}/${projectSlug}`);
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
        <div className="flex items-center justify-center">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-3xl"
            >
                <h1 className="text-3xl font-semibold my-8">Create Phase</h1>
                <FieldGroup>
                    <Field>
                        <FieldLabel>Phase Name</FieldLabel>
                        <Input
                            {...register("name")}
                            placeholder="Phase Name"
                            id="name"
                        />
                        {errors.name && (
                            <FieldError>{errors.name.message}</FieldError>
                        )}
                    </Field>
                    <Field>
                        <FieldLabel>Budget</FieldLabel>
                        <Input
                            {...register("budget")}
                            type="number"
                            placeholder="Budget"
                            id="budget"
                        />
                        {errors.budget && (
                            <FieldError>{errors.budget.message}</FieldError>
                        )}
                    </Field>
                </FieldGroup>
                <FieldGroup className="flex flex-row ">
                    <Field>
                        <FieldLabel>Description</FieldLabel>
                        <Textarea
                            {...register("description")}
                            placeholder="Description"
                            id="description"
                            className="flex-1"
                        />
                        {errors.description && (
                            <FieldError>
                                {errors.description.message}
                            </FieldError>
                        )}
                    </Field>
                    <Field className="">
                        <FieldLabel>Payment Deadline</FieldLabel>
                        <div className="flex justify-center items-center">
                            <Controller
                                control={control}
                                name="paymentDeadline"
                                render={({ field }) => (
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        className="rounded-lg border"
                                        captionLayout="dropdown"
                                        showWeekNumber={true}
                                        disabled={(date) => date < new Date()}
                                    />
                                )}
                            />
                        </div>
                    </Field>
                </FieldGroup>
                <Field className="">
                    <FieldLabel>Payment Deadline</FieldLabel>
                    <div className="flex justify-center items-center">
                        <Controller
                            control={control}
                            name="startDate"
                            render={({ field }) => (
                                <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    className="rounded-lg border"
                                    captionLayout="dropdown"
                                    showWeekNumber={true}
                                    disabled={(date) => date < new Date()}
                                />
                            )}
                        />
                    </div>
                </Field>

                {error && <FieldError className="mt-4">{error}</FieldError>}
                <div className="w-full flex justify-end mt-8">
                    <Button type="submit" className="w-60" disabled={isLoading}>
                        {isLoading && <Spinner className="mr-2" />}
                        Create Project
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default PhaseCreationForm;
