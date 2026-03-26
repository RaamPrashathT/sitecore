import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FcGoogle } from "react-icons/fc";
import { useForm } from "react-hook-form";
import { registerSchema, type RegisterInput } from "@/features/auth/authSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Spinner } from "../../../components/ui/spinner";
import axios from "axios";
import { useInvitationDetails } from "@/features/clients/hooks/useInvitationDetails";

export function RegisterForm({
    className,
    ...props
}: React.ComponentProps<"form">) {
    const [searchParams] = useSearchParams();
    const inviteToken = searchParams.get("token");

    const { data: invitation, isLoading } = useInvitationDetails(inviteToken);
    const invitedEmail = invitation?.invitedEmail;

    const navigate = useNavigate();

    const [apiMessage, setApiMessage] = useState<{
        success: boolean;
        message: string;
    } | null>(null);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { isSubmitting, errors },
    } = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
        defaultValues: { email: "", password: "" },
    });

    // pre-fill and lock email if coming from invite
    useEffect(() => {
        if (invitedEmail) {
            setValue("email", invitedEmail, { shouldValidate: true });
        }
    }, [invitedEmail, setValue]);

    const onSubmit = async (data: RegisterInput) => {
        setApiMessage(null);
        try {
            const result = await api.post("/auth/register", {
                email: data.email,
                password: data.password,
                inviteToken: inviteToken || undefined,
            });

            setApiMessage({
                success: result.data.success,
                message: result.data.message,
            });

            if (result.data.success) {
                if (result.data.frictionlessLogin) {
                    // invited user — already verified, go straight to accept
                    navigate(`/invitation?token=${inviteToken}`);
                } else if (inviteToken) {
                    // needs email verification — carry both tokens through
                    navigate(
                        `/verify-email?token=${result.data.token}&inviteToken=${inviteToken}`,
                    );
                } else {
                    // normal registration
                    navigate(`/verify-email?token=${result.data.token}`);
                }
            }
        } catch (error: unknown) {
            const message = axios.isAxiosError(error)
                ? (error.response?.data?.message ?? "Registration failed")
                : "An unexpected error occurred";

            setApiMessage({ success: false, message });
        }
    };

    if (isLoading && inviteToken) return <Spinner />;

    return (
        <form
            className={cn("flex flex-col gap-6", className)}
            {...props}
            onSubmit={handleSubmit(onSubmit)}
        >
            <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                    <h1 className="text-2xl font-bold">Create an account</h1>
                    {invitedEmail && (
                        <p className="text-sm text-muted-foreground">
                            Registering as{" "}
                            <span className="font-medium">{invitedEmail}</span>{" "}
                            to accept your invite
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
                        className={cn(
                            !!invitedEmail && "opacity-60 cursor-not-allowed",
                        )}
                    />
                    {errors.email && (
                        <FieldError>{errors.email.message}</FieldError>
                    )}
                </Field>

                <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                        {...register("password")}
                        id="password"
                        type="password"
                        required
                    />
                    {errors.password && (
                        <FieldError>{errors.password.message}</FieldError>
                    )}
                </Field>

                <Field>
                    <FieldLabel htmlFor="confirmPassword">
                        Confirm Password
                    </FieldLabel>
                    <Input
                        {...register("confirmPassword")}
                        id="confirmPassword"
                        type="password"
                        required
                    />
                    {errors.confirmPassword && (
                        <FieldError>
                            {errors.confirmPassword.message}
                        </FieldError>
                    )}
                </Field>

                <Field>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <div className="flex items-center gap-x-1.5">
                                <Spinner />
                                Registering...
                            </div>
                        ) : (
                            "Register"
                        )}
                    </Button>
                </Field>

                {apiMessage && (
                    <FieldError
                        className={`text-center ${apiMessage.success ? "text-green-500" : "text-red-500"}`}
                    >
                        {apiMessage.message}
                    </FieldError>
                )}

                <FieldSeparator>Or continue with</FieldSeparator>

                <Field>
                    <Button
                        variant="outline"
                        type="button"
                        className="flex items-center"
                        onClick={() => {
                            const googleUrl = inviteToken
                                ? `${import.meta.env.VITE_API_URL}/auth/google?inviteToken=${inviteToken}`
                                : `${import.meta.env.VITE_API_URL}/auth/google`;
                            globalThis.location.href = googleUrl;
                        }}
                    >
                        <FcGoogle className="mt-0.5 mr-2" />
                        Continue with Google
                    </Button>

                    <FieldDescription className="text-center">
                        Already have an account?{" "}
                        <a
                            href={
                                inviteToken
                                    ? `/login?token=${inviteToken}`
                                    : "/login"
                            }
                            className="underline underline-offset-4 hover:text-green-700"
                        >
                            Log in
                        </a>
                    </FieldDescription>
                </Field>
            </FieldGroup>
        </form>
    );
}