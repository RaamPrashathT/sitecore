import { Button } from "@/components/ui/button";
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Spinner } from "@/components/ui/spinner";
import api from "@/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import z from "zod";
import { useProjectDetails } from "@/features/project/details/hooks/useProjectDetails";

const formSchema = z.object({
    email: z.email("Invalid email address"),
    role: z.enum(["CLIENT", "ENGINEER"]),
});
type FormValues = z.infer<typeof formSchema>;

interface PayloadSchema {
    email: string;
    role: string;
}

const ProjectsMembersInvite = () => {
    const { orgSlug, projectSlug } = useParams();
    const navigate = useNavigate();
    const { data: project, isLoading: isProjectLoading } = useProjectDetails(orgSlug, projectSlug);
    const isProjectActive = project?.status === "ACTIVE";
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
        },
    });

    const { mutate, isPending, error, isError } = useMutation({
        mutationFn: async (data: PayloadSchema) => {
            return api.post(`/project/invitation`, data);
        },
        onSuccess: () => {
            navigate(`/${orgSlug}/${projectSlug}`);
        },
    });

    const onSubmit = (data: FormValues) => {
        mutate(data);
    };

    if (isProjectLoading) {
        return (
            <div className="w-full max-w-xl mx-auto mt-12 mb-20 p-6 font-sans text-[#737c7f]">
                Loading project state...
            </div>
        );
    }

    if (project && !isProjectActive) {
        return (
            <div className="w-full max-w-xl mx-auto mt-12 mb-20 p-6">
                <div className="bg-white p-10 rounded-xl border border-[#abb3b7]/20 shadow-sm">
                    <h1 className="font-display text-3xl font-light text-[#2b3437] tracking-tight mb-4">
                        Invite Member
                    </h1>
                    <p className="text-sm text-[#737c7f]">
                        Member invitations are locked until the project is ACTIVE.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-xl mx-auto mt-12 mb-20 p-6">
            <div className="bg-white p-10 rounded-xl border border-[#abb3b7]/20 shadow-sm">
                <h1 className="font-display text-3xl font-light text-[#2b3437] tracking-tight mb-8">
                    Invite Member
                </h1>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    <FieldGroup className="">
                        <Field className="space-y-2">
                            <FieldLabel className="text-sm font-medium text-[#586064]">
                                Email Address
                            </FieldLabel>
                            <Input
                                {...register("email")}
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                className="focus-visible:ring-[#006d30] border-[#abb3b7]/40 text-[#2b3437]"
                            />
                            {errors.email && (
                                <FieldError className="text-[#9e422c] text-xs mt-1">
                                    {errors.email.message}
                                </FieldError>
                            )}
                        </Field>
                        <Field className="space-y-3">
                            <FieldLabel className="text-sm font-medium text-[#586064]">
                                Select Role
                            </FieldLabel>

                            <Controller
                                name="role"
                                control={control}
                                render={({ field }) => (
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex flex-col gap-3"
                                    >
                                        {/* CLIENT */}
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <RadioGroupItem
                                                value="CLIENT"
                                                id="client"
                                            />
                                            <div>
                                                <p className="text-sm font-medium text-[#2b3437]">
                                                    Client
                                                </p>
                                                <p className="text-xs text-[#737c7f]">
                                                    External stakeholder with
                                                    limited access
                                                </p>
                                            </div>
                                        </label>

                                        {/* ENGINEER */}
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <RadioGroupItem
                                                value="ENGINEER"
                                                id="engineer"
                                            />
                                            <div>
                                                <p className="text-sm font-medium text-[#2b3437]">
                                                    Engineer
                                                </p>
                                                <p className="text-xs text-[#737c7f]">
                                                    Internal team member with
                                                    full access
                                                </p>
                                            </div>
                                        </label>
                                    </RadioGroup>
                                )}
                            />

                            {errors.role && (
                                <FieldError className="text-[#9e422c] text-xs mt-1">
                                    {errors.role.message}
                                </FieldError>
                            )}
                        </Field>
                    </FieldGroup>

                    <div className="pt-6 flex flex-col items-start gap-3 border-t border-[#abb3b7]/20">
                        <Button
                            disabled={isPending}
                            type="submit"
                            className="w-full sm:w-auto px-8 bg-gradient-to-tr from-[#006d30] to-[#00602a] hover:opacity-95 text-[#e4ffe2] shadow-sm"
                        >
                            {isPending ? (
                                <div className="flex items-center gap-x-2">
                                    <Spinner className="w-4 h-4 text-white" />
                                    <span>Sending Invite...</span>
                                </div>
                            ) : (
                                <span>Send Invitation Link</span>
                            )}
                        </Button>

                        {isError && (
                            <FieldError className="text-[#9e422c] text-sm mt-2">
                                {error?.message ||
                                    "Something went wrong. Please try again."}
                            </FieldError>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProjectsMembersInvite;
