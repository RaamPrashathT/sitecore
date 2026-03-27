import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FcGoogle } from "react-icons/fc";
import { useForm } from "react-hook-form";
import { registerSchema, type RegisterInput } from "@/features/auth/authSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { Spinner } from "../../../components/ui/spinner";
import axios from "axios";
import { useInvitationDetails } from "@/features/clients/hooks/useInvitationDetails";
import { useRegister } from "@/features/auth/hooks/useRegister";

export function RegisterForm({ className, ...props }: React.ComponentProps<"form">) {
    const [searchParams] = useSearchParams();
    const inviteToken = searchParams.get("token");
    const navigate = useNavigate();

    const { data: invitation, isLoading: isInviteLoading } = useInvitationDetails(inviteToken);
    const { mutateAsync: registerUser, isPending: isRegistering } = useRegister();
    const invitedEmail = invitation?.invitedEmail;

    const { register, handleSubmit, setValue, setError, formState: { errors } } = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
        defaultValues: { email: "", password: "", confirmPassword: "" },
    });

    useEffect(() => {
        if (invitedEmail) setValue("email", invitedEmail, { shouldValidate: true });
    }, [invitedEmail, setValue]);

    const onSubmit = async (data: RegisterInput) => {
        try {
            const result = await registerUser({ ...data, inviteToken: inviteToken || undefined });

            if (result.frictionlessLogin) {
                navigate(inviteToken ? `/provisioning?token=${inviteToken}` : "/provisioning");
            } else {
                const url = `/verify-email?token=${result.token}`;
                navigate(inviteToken ? `${url}&inviteToken=${inviteToken}` : url);
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response?.data) {
                setError("root", { message: error.response.data.message || "Registration failed" });
            } else {
                setError("root", { message: "An unexpected error occurred. Try again." });
            }
        }
    };

    if (isInviteLoading && inviteToken) return <Spinner />;

    return (
        <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                    <h1 className="text-2xl font-bold">Create an account</h1>
                    {invitedEmail && (
                        <p className="text-sm text-muted-foreground">
                            Registering as <span className="font-medium">{invitedEmail}</span> to accept your invite
                        </p>
                    )}
                </div>

                <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                        {...register("email")}
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        readOnly={!!invitedEmail}
                        className={cn(!!invitedEmail && "opacity-60 cursor-not-allowed")}
                    />
                    {errors.email && <FieldError>{errors.email.message}</FieldError>}
                </Field>

                <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input {...register("password")} id="password" type="password" />
                    {errors.password && <FieldError>{errors.password.message}</FieldError>}
                </Field>

                <Field>
                    <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                    <Input {...register("confirmPassword")} id="confirmPassword" type="password" />
                    {errors.confirmPassword && <FieldError>{errors.confirmPassword.message}</FieldError>}
                </Field>

                {errors.root && <FieldError className="text-center text-red-500">{errors.root.message}</FieldError>}

                <Field>
                    <Button type="submit" disabled={isRegistering}>
                        {isRegistering ? (
                            <div className="flex items-center gap-x-1.5"><Spinner /> Registering...</div>
                        ) : "Register"}
                    </Button>
                </Field>

                <FieldSeparator>Or continue with</FieldSeparator>

                <Field>
                    <Button
                        variant="outline"
                        type="button"
                        className="flex items-center"
                        onClick={() => {
                            globalThis.location.href = `${import.meta.env.VITE_API_URL}/auth/google${inviteToken ? `?inviteToken=${inviteToken}` : ""}`;
                        }}
                    >
                        <FcGoogle className="mt-0.5 mr-2" /> Continue with Google
                    </Button>

                    <FieldDescription className="text-center">
                        Already have an account?{" "}
                        <a href={`/login${inviteToken ? `?token=${inviteToken}` : ""}`} className="underline underline-offset-4 hover:text-green-700">
                            Log in
                        </a>
                    </FieldDescription>
                </Field>
            </FieldGroup>
        </form>
    );
}