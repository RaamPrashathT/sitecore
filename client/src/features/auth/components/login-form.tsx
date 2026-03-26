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
import api from "@/lib/axios";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Spinner } from "../../../components/ui/spinner";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";

type ApiErrorResponse = {
    code?: string;
    message?: string;
    verificationToken?: string;
};

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"form">) {
    const queryClient = useQueryClient();
    const [apiMessage, setApiMessage] = useState<{
        success: boolean;
        message: string;
    } | null>(null);
    const {
        register,
        handleSubmit,
        formState: { isSubmitting, errors },
    } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });
    const navigate = useNavigate();

    const onSubmit = async (data: LoginInput) => {
        setApiMessage(null);
        try {
            queryClient.clear();
            const result = await api.post("/auth/login", data);
            setApiMessage({
                success: result.data.success,
                message: result.data.message,
            });

            if (result.data.success) {
                const inviteToken = sessionStorage.getItem("pending_invite_token");
                if (inviteToken) {
                    navigate(`/invitation?token=${inviteToken}`);
                } else {
                    navigate("/organizations");
                }
            }
        } catch (error: unknown) {
            let message = "Something went wrong";

            if (axios.isAxiosError<ApiErrorResponse>(error)) {
                const data = error.response?.data;

                switch (data?.code) {
                    case "INVALID_CREDENTIALS":
                        message = "Invalid email or password";
                        break;

                    case "EMAIL_NOT_VERIFIED":
                        message = "OTP sent. Redirecting...";

                        if (data.verificationToken) {
                            navigate(
                                `/verify-email?token=${data.verificationToken}`,
                            );
                            return;
                        }
                        break;

                    case "INTERNAL_ERROR":
                        message = "Server error. Try again later.";
                        break;

                    default:
                        message = data?.message ?? "Login failed";
                }
            } else if (error instanceof Error) {
                message = error.message;
            }

            setApiMessage({
                success: false,
                message,
            });
        }
    };

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
                </div>
                <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                        {...register("email")}
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                    />
                    {errors.email && (
                        <FieldError>{errors.email.message}</FieldError>
                    )}
                </Field>
                <Field>
                    <div className="flex items-center">
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                        {/* <a
                            href="/forget-password"
                            className="ml-auto text-sm underline-offset-4 hover:underline"
                        >
                            Forgot your password?
                        </a> */}
                    </div>
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
                    <Button type="submit" disabled={isSubmitting} className="">
                        {isSubmitting ? (
                            <div className="flex items-center gap-x-1.5">
                                <Spinner />
                                <p>Logging you in...</p>
                            </div>
                        ) : (
                            "Login"
                        )}
                    </Button>
                </Field>
                {apiMessage && (
                    <FieldError
                        className={`text-center ${apiMessage?.success ? "text-green-500" : "text-red-500"}`}
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
                            const inviteToken = sessionStorage.getItem("pending_invite_token");
                            const googleUrl = inviteToken 
                                ? `http://localhost:3000/auth/google?inviteToken=${inviteToken}`
                                : `http://localhost:3000/auth/google`;
                            
                            globalThis.location.href = googleUrl;
                        }}
                    >
                        <FcGoogle className="mt-0.5 mr-2" />
                        Login with Google
                    </Button>
                    <FieldDescription className="text-center">
                        Don&apos;t have an account?{" "}
                        <a
                            href="register"
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
