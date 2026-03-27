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

const Verify2FA = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [value, setValue] = React.useState("");

    const searchParams = new URLSearchParams(globalThis.location.search);
    const token = searchParams.get("token")

    const {
        mutate: verify,
        isPending,
        error,
        isError,
    } = useMutation({
        mutationFn: async (otp: string) => {
            return api.post("/auth/verify-2fa", { token, otp });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["session"] });
            navigate("/provisioning");
        },
    });

    if (!token) {
        navigate("/login");
        return null;
    }

    return (
        <div className="flex flex-col items-center gap-6 mb-6">
            <h1 className="text-2xl font-bold">Two-Step Verification</h1>
            <p>Enter the 6-digit security code sent to your email.</p>

            <InputOTP maxLength={6} value={value} onChange={setValue} disabled={isPending}>
                <InputOTPGroup>
                    <InputOTPSlot index={0} aria-invalid={isError} />
                    <InputOTPSlot index={1} aria-invalid={isError} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                    <InputOTPSlot index={2} aria-invalid={isError} />
                    <InputOTPSlot index={3} aria-invalid={isError} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                    <InputOTPSlot index={4} aria-invalid={isError} />
                    <InputOTPSlot index={5} aria-invalid={isError} />
                </InputOTPGroup>
            </InputOTP>

            {error && (
                <p className="text-red-500 text-sm">
                    {axios.isAxiosError(error) ? error.response?.data?.message : "Verification failed"}
                </p>
            )}

            <Button onClick={() => verify(value)} disabled={isPending || value.length !== 6}>
                {isPending ? "Verifying..." : "Verify & Login"}
            </Button>
        </div>
    );
};

export default Verify2FA;