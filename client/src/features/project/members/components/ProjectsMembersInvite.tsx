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
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import z from "zod";

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
    const {
        register,
        handleSubmit,
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

    return (
        <div className="w-full max-w-xl mx-auto mt-12 mb-20 p-6">
            <div className="bg-white p-10 rounded-xl border border-[#abb3b7]/20 shadow-sm">
                <h1 className="font-serif text-3xl font-light text-[#2b3437] tracking-tight mb-8">
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

                            <RadioGroup
                                onValueChange={(value) => {
                                    // react-hook-form bridge
                                    register("role").onChange({
                                        target: { value },
                                    });
                                }}
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
                                            External stakeholder with limited
                                            access
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
                                            Internal team member with full
                                            access
                                        </p>
                                    </div>
                                </label>
                            </RadioGroup>

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
