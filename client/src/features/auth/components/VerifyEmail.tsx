import React from "react";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import axios from "axios";

const VerifyEmail = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [value, setValue] = React.useState("");

    const token = new URLSearchParams(globalThis.location.search).get("token");
    console.log(token)
    const {
        mutate: verify,
        isPending,
        error,
        isError,
    } = useMutation({
        mutationFn: async (otp: string) => {
            return api.post("/auth/verify-email", { token, otp });
        },
        onSuccess: () => {
            queryClient.clear();
            navigate("/organizations");
        },
        onError: () => {
            console.log("error")
        }
    });

    if (!token) {
        navigate("/login");
        return null;
    }

    return (
        <div className="flex flex-col items-center gap-6 mb-6">
            <h1 className="text-2xl font-bold">Verify your Email</h1>
            <p>Enter the 6-digit code sent to your email.</p>

            <InputOTP
                maxLength={6}
                value={value}
                onChange={(value) => setValue(value)}
                disabled={isPending}
            >
                <InputOTPGroup>
                    <InputOTPSlot index={0} aria-invalid ={isError} />
                    <InputOTPSlot index={1} aria-invalid ={isError} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                    <InputOTPSlot index={2} aria-invalid ={isError} />
                    <InputOTPSlot index={3} aria-invalid ={isError} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                    <InputOTPSlot index={4} aria-invalid ={isError} />
                    <InputOTPSlot index={5} aria-invalid ={isError} />
                </InputOTPGroup>
            </InputOTP>

            {error && (
                <p className="text-red-500 text-sm">
                    {axios.isAxiosError(error)
                        ? error.response?.data?.message
                        : "Verification failed"}
                </p>
            )}

            <Button
                onClick={() => verify(value)}
                disabled={isPending || value.length !== 6}
            >
                {isPending ? "Verifying..." : "Verify & Login"}
            </Button>
        </div>
    );
};

export default VerifyEmail;
