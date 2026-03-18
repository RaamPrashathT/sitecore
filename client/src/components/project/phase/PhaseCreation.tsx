import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useMembership } from "@/hooks/useMembership";
import { useProjectDetails } from "@/hooks/useProjectDetails";
import api from "@/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
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

                <div className="flex flex-col gap-y-8">
                    <FieldGroup className="flex flex-row gap-4">
                        <Field className="flex-1">
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
                        <Field className="flex-1">
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

                    <FieldGroup>
                        <Field>
                            <FieldLabel>Description</FieldLabel>
                            <Textarea
                                {...register("description")}
                                placeholder="Description"
                                id="description"
                            />
                            {errors.description && (
                                <FieldError>
                                    {errors.description.message}
                                </FieldError>
                            )}
                        </Field>
                    </FieldGroup>

                    <FieldGroup className="flex flex-row gap-4">
                        <Field className="flex-1">
                            <FieldLabel>Payment Deadline</FieldLabel>
                            <Controller
                                control={control}
                                name="paymentDeadline"
                                render={({ field }) => (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start text-left font-normal"
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {field.value ? (
                                                    format(field.value, "PPP")
                                                ) : (
                                                    <span className="text-muted-foreground">
                                                        Pick a date
                                                    </span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            className="w-auto p-0"
                                            align="start"
                                        >
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                className="rounded-lg border"
                                                captionLayout="dropdown"
                                                showWeekNumber={true}
                                                disabled={(date) =>
                                                    date < new Date()
                                                }
                                            />
                                        </PopoverContent>
                                    </Popover>
                                )}
                            />
                            {errors.paymentDeadline && (
                                <FieldError>
                                    {errors.paymentDeadline.message}
                                </FieldError>
                            )}
                        </Field>
                        <Field className="flex-1">
                            <FieldLabel>Start Date</FieldLabel>
                            <Controller
                                control={control}
                                name="startDate"
                                render={({ field }) => (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start text-left font-normal"
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {field.value ? (
                                                    format(field.value, "PPP")
                                                ) : (
                                                    <span className="text-muted-foreground">
                                                        Pick a date
                                                    </span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            className="w-auto p-0"
                                            align="start"
                                        >
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                className="rounded-lg border"
                                                captionLayout="dropdown"
                                                showWeekNumber={true}
                                                disabled={(date) =>
                                                    date < new Date()
                                                }
                                            />
                                        </PopoverContent>
                                    </Popover>
                                )}
                            />
                            {errors.startDate && (
                                <FieldError>
                                    {errors.startDate.message}
                                </FieldError>
                            )}
                        </Field>
                    </FieldGroup>
                </div>
                {error && <FieldError className="mt-4">{error}</FieldError>}
                <div className="w-full flex justify-end mt-10">
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
