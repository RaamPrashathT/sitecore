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
import { loginSchema, type LoginInput } from "@/features/auth/authSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { Spinner } from "../../../components/ui/spinner";
import axios from "axios";
import { useInvitationDetails } from "@/features/clients/hooks/useInvitationDetails";
import { useLogin } from "@/features/auth/hooks/useLogin";

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"form">) {
    const [searchParams] = useSearchParams();
    const inviteToken = searchParams.get("token");
    const navigate = useNavigate();

    const { data: invitation, isLoading: isInviteLoading } =
        useInvitationDetails(inviteToken);
    const { mutateAsync: loginUser, isPending: isLoggingIn } = useLogin();
    const invitedEmail = invitation?.invitedEmail;

    const {
        register,
        handleSubmit,
        setValue,
        setError,
        formState: { errors },
    } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    useEffect(() => {
        if (invitedEmail)
            setValue("email", invitedEmail, { shouldValidate: true });
    }, [invitedEmail, setValue]);

    const onSubmit = async (data: LoginInput) => {
        try {
            await loginUser({
                ...data,
                inviteToken: inviteToken || undefined,
            });
            navigate(
                inviteToken
                    ? `/provisioning?token=${inviteToken}`
                    : "/provisioning",
            );
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response?.data) {
                const apiData = error.response.data;
                if (apiData.code === "EMAIL_NOT_VERIFIED") {
                    const url = `/verify-email?token=${apiData.verificationToken}`;
                    navigate(
                        inviteToken ? `${url}&inviteToken=${inviteToken}` : url,
                    );
                    return;
                }
                if (apiData.code === "2FA_REQUIRED") {
                    const url = `/verify-2fa?token=${apiData.tempToken}`;
                    navigate(
                        inviteToken ? `${url}&inviteToken=${inviteToken}` : url,
                    );
                    return;
                }
                setError("root", {
                    message: apiData.message || "Invalid email or password",
                });
            } else {
                setError("root", {
                    message: "An unexpected error occurred. Try again.",
                });
            }
        }
    };

    if (isInviteLoading && inviteToken) return <Spinner />;

    return (
        <form
            className={cn("flex flex-col gap-6", className)}
            {...props}
            onSubmit={handleSubmit(onSubmit)}
        >
            <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                    <h1 className="text-2xl font-bold">
                        Login to your account
                    </h1>
                    {invitedEmail && (
                        <p className="text-sm text-muted-foreground">
                            Logging in as{" "}
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
                    />
                    {errors.password && (
                        <FieldError>{errors.password.message}</FieldError>
                    )}
                </Field>

                <Field>
                    <Button type="submit" disabled={isLoggingIn}>
                        {isLoggingIn ? (
                            <div className="flex items-center gap-x-1.5">
                                <Spinner /> Logging in...
                            </div>
                        ) : (
                            "Login"
                        )}
                    </Button>
                </Field>
                {errors.root && (
                    <FieldError className="text-center text-red-500">
                        {errors.root.message}
                    </FieldError>
                )}

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
                        <FcGoogle className="mt-0.5 mr-2" /> Login with Google
                    </Button>

                    <FieldDescription className="text-center">
                        Don&apos;t have an account?{" "}
                        <a
                            href={`/register${inviteToken ? `?token=${inviteToken}` : ""}`}
                            className="underline underline-offset-4 hover:text-green-700"
                        >
                            Register
                        </a>
                    </FieldDescription>
                </Field>
            </FieldGroup>
        </form>
    );
}
