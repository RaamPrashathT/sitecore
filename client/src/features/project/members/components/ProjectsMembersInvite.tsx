import { Button } from "@/components/ui/button";
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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
    const { orgSlug ,projectSlug } = useParams()
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
            navigate(`/${orgSlug}/${projectSlug}`)
        },
    });

    const onSubmit = (data: FormValues) => {
        mutate(data);
    };

    return (
        <div className="w-full max-w-xl mx-auto mb-20 p-6">
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                <h1 className="text-2xl font-semibold text-gray-900 mb-6">
                    Invite Member
                </h1>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <FieldGroup className="space-y-6">
                        <Field className="space-y-2">
                            <FieldLabel className="text-sm font-medium text-gray-700">
                                Email Address
                            </FieldLabel>
                            <Input
                                {...register("email")}
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                className="focus-visible:ring-green-700"
                            />
                            {errors.email && (
                                <FieldError className="text-red-500 text-xs mt-1">
                                    {errors.email.message}
                                </FieldError>
                            )}
                        </Field>

                        <Field className="space-y-3">
                            <FieldLabel className="text-sm font-medium text-gray-700">
                                Select Role
                            </FieldLabel>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <label className="cursor-pointer relative">
                                    <input
                                        type="radio"
                                        value="CLIENT"
                                        className="peer sr-only"
                                        {...register("role")}
                                    />
                                    <div className="rounded-xl border border-gray-200 bg-white p-4 hover:bg-gray-50 peer-checked:border-green-700 peer-checked:bg-green-50/50 peer-checked:ring-1 peer-checked:ring-green-700 transition-all">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-sm font-semibold text-gray-900">
                                                Client
                                            </p>
                                            <div className="h-4 w-4 rounded-full border border-gray-300 peer-checked:border-green-700 peer-checked:border-[4px] bg-white transition-all"></div>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            External stakeholder with restricted view access.
                                        </p>
                                    </div>
                                </label>

                                <label className="cursor-pointer relative">
                                    <input
                                        type="radio"
                                        value="ENGINEER"
                                        className="peer sr-only"
                                        {...register("role")}
                                    />
                                    <div className="rounded-xl border border-gray-200 bg-white p-4 hover:bg-gray-50 peer-checked:border-green-700 peer-checked:bg-green-50/50 peer-checked:ring-1 peer-checked:ring-green-700 transition-all">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-sm font-semibold text-gray-900">
                                                Engineer
                                            </p>
                                            <div className="h-4 w-4 rounded-full border border-gray-300 peer-checked:border-green-700 peer-checked:border-[4px] bg-white transition-all"></div>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            Internal team member with full collaboration access.
                                        </p>
                                    </div>
                                </label>
                            </div>

                            {errors.role && (
                                <FieldError className="text-red-500 text-xs mt-1">
                                    {errors.role.message}
                                </FieldError>
                            )}
                        </Field>
                    </FieldGroup>

                    <div className="pt-4 flex flex-col items-start gap-3 border-t border-gray-100">
                        <Button 
                            disabled={isPending} 
                            type="submit" 
                            className="w-full sm:w-auto px-8 bg-green-700 hover:bg-green-800 text-white"
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
                            <FieldError className="text-red-500 text-sm">
                                {error?.message || "Something went wrong. Please try again."}
                            </FieldError>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProjectsMembersInvite;