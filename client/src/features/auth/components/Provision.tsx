import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSession } from "@/features/auth/hooks/useSession";
import { useProvision } from "@/features/auth/hooks/useProvision";
import { OnboardingForm } from "@/features/auth/components/onboarding-form";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent } from "@/components/ui/card";

export default function Provision() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();

    const { user, isLoading: isSessionLoading } = useSession();
    const { mutate, isPending: isProvisioning, isError: provisionFailed } = useProvision();

    useEffect(() => {
        if (user?.onboarded) {
            mutate(token, {
                onSuccess: (data) => {
                    navigate(data.redirectTo, { replace: true });
                }
            });
        }
    }, [user, user?.onboarded, token, mutate, navigate]);

    if (isSessionLoading) {
        return (
            <div className="flex min-h-[80vh] items-center justify-center">
                <Spinner />
            </div>
        );
    }

    if (!user) {
        navigate("/login");
        return null;
    }

    if (user.onboarded || isProvisioning) {
        return (
            <div className="flex min-h-[80vh] flex-col gap-4 items-center justify-center p-4 text-center">
                <Spinner />
                <h2 className="text-xl font-semibold">Setting up your workspace...</h2>
                <p className="text-sm text-muted-foreground">This will just take a second.</p>
                {provisionFailed && (
                    <p className="text-sm text-red-500 mt-2">
                        Something went wrong during sync. Please refresh the page.
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className="flex min-h-[80vh] items-center justify-center p-4">
            <Card className="w-full max-w-2xl shadow-none border-none">
                <CardContent className="pt-6 flex justify-center items-center">
                    <OnboardingForm  className=""/>
                </CardContent>
            </Card>
        </div>
    );
}