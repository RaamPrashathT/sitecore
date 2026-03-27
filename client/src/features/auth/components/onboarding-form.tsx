import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Controller, useForm } from "react-hook-form";
import { onboardSchema, type OnboardInput } from "@/features/auth/authSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Spinner } from "@/components/ui/spinner";
import axios from "axios";
import { useOnboard } from "../hooks/useOnboard";
import { useSession } from "../hooks/useSession";
import { Switch } from "@/components/ui/switch";
import { useRef, useState, useEffect } from "react";
import { uploadToCloudinary } from "@/lib/cloudinary"; 
export function OnboardingForm({
    className,
    ...props
}: React.ComponentProps<"form">) {
    const { user } = useSession();
    const { mutateAsync: submitOnboard, isPending: isSubmitting } = useOnboard();

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarError, setAvatarError] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const {
        register,
        handleSubmit,
        setError,
        control,
        formState: { errors },
    } = useForm<OnboardInput>({
        resolver: zodResolver(onboardSchema),
        defaultValues: {
            username: user?.username || "",
            phone: "",
            isTwoFactorEnabled: false,
        },
    });

    function openPicker() {
        if (!fileInputRef.current) return;
        fileInputRef.current.value = "";
        fileInputRef.current.click();
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setAvatarError("");

        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            setAvatarError("JPG, PNG or WEBP only.");
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setAvatarError("Must be under 2 MB.");
            return;
        }

        if (previewUrl) URL.revokeObjectURL(previewUrl);

        setPreviewUrl(URL.createObjectURL(file)); 
        setAvatarFile(file);                  
    }

    function handleRemove(e: React.MouseEvent) {
        e.stopPropagation(); 
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setAvatarFile(null);
        setAvatarError("");
    }

    const onSubmit = async (data: OnboardInput) => {
        try {
            let avatarUrl = "";
            if (avatarFile) {
                avatarUrl = await uploadToCloudinary(avatarFile);
            }
            const payload = {
                username: data.username,
                isTwoFactorEnabled: data.isTwoFactorEnabled,
                ...(data.phone?.trim() && { phone: data.phone.trim() }),
                ...(avatarUrl.trim() && { avatar: avatarUrl.trim() }),
            };
            await submitOnboard(payload);
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response?.data) {
                setError("root", {
                    message:
                        error.response.data.message || "Failed to save profile.",
                });
            } else {
                setError("root", { message: "An unexpected error occurred." });
            }
        }
    };

    const initials = (user?.username ?? "?")
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <form
            className={cn("flex flex-col gap-5 w-full max-w-sm", className)}
            {...props}
            onSubmit={handleSubmit(onSubmit)}
        >
            <div className="flex flex-col gap-0.5">
                <h1 className="text-xl font-semibold tracking-tight">
                    Complete your profile
                </h1>
                <p className="text-sm text-muted-foreground">
                    Finish setting up your account.
                </p>
            </div>

            <FieldGroup className="flex flex-col gap-4">

                <Field className="flex flex-col gap-1.5">
                    <FieldLabel className="text-sm font-medium">
                        Profile photo
                    </FieldLabel>

                    <div className="flex items-center gap-3">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={handleFileChange}
                        />

                        <div className="relative shrink-0 cursor-pointer group" onClick={openPicker}>
                            <div className="h-14 w-14 rounded-full overflow-hidden border border-border bg-muted flex items-center justify-center">
                                {previewUrl ? (
                                    <img
                                        src={previewUrl}
                                        alt="Avatar preview"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span className="text-sm font-medium text-muted-foreground select-none">
                                        {initials}
                                    </span>
                                )}
                            </div>

                            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg
                                    className="w-4 h-4 text-white"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487z"
                                    />
                                </svg>
                            </div>

                            {previewUrl && (
                                <button
                                    type="button"
                                    onClick={handleRemove}
                                    className="absolute -top-0.5 -right-0.5 h-4.5 w-4.5 rounded-full bg-destructive border-2 border-background flex items-center justify-center"
                                    aria-label="Remove photo"
                                >
                                    <svg
                                        className="w-2.5 h-2.5 text-destructive-foreground"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={3}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            )}
                        </div>

                        <div className="flex flex-col gap-0.5">
                            <span className="text-sm text-foreground">
                                {previewUrl ? "Click to change" : "Upload a photo"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                JPG, PNG or WEBP · max 2 MB
                            </span>
                            {avatarError && (
                                <span className="text-xs text-destructive">
                                    {avatarError}
                                </span>
                            )}
                        </div>
                    </div>
                </Field>

                <Field className="flex flex-col gap-1.5">
                    <div className="flex gap-0.5 text-sm font-medium">
                        Username
                        <p className="text-destructive">*</p>
                    </div>
                    <Input
                        {...register("username")}
                        id="username"
                        autoComplete="username"
                    />
                    {errors.username && (
                        <FieldError className="text-xs">
                            {errors.username.message}
                        </FieldError>
                    )}
                </Field>

                <Field className="flex flex-col gap-1.5">
                    <FieldLabel htmlFor="phone" className="text-sm font-medium">
                        Phone number
                        <p className="ml-1 text-xs font-normal text-muted-foreground">
                            (optional)
                        </p>
                    </FieldLabel>
                    <Input
                        {...register("phone")}
                        id="phone"
                        type="tel"
                        placeholder="98765 43210"
                    />
                    {errors.phone && (
                        <FieldError className="text-xs">
                            {errors.phone.message}
                        </FieldError>
                    )}
                </Field>

                <Field className="flex flex-row items-center justify-between rounded-md border border-border px-3 py-2.5">
                    <div className="flex flex-col gap-0.5">
                        <FieldLabel
                            htmlFor="isTwoFactorEnabled"
                            className="text-sm font-medium cursor-pointer"
                        >
                            Two-factor authentication
                        </FieldLabel>
                        <p className="text-xs text-muted-foreground">
                            Add an extra layer of security.
                        </p>
                    </div>
                    <Controller
                        name="isTwoFactorEnabled"
                        control={control}
                        render={({ field }) => (
                            <Switch
                                id="isTwoFactorEnabled"
                                name={field.name}
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        )}
                    />
                </Field>

                {errors.root && (
                    <FieldError className="text-center text-xs text-destructive">
                        {errors.root.message}
                    </FieldError>
                )}

                <Button type="submit" disabled={isSubmitting} className="w-full mt-1">
                    {isSubmitting ? (
                        <span className="flex items-center gap-2">
                            <Spinner /> Saving...
                        </span>
                    ) : (
                        "Continue"
                    )}
                </Button>

            </FieldGroup>
        </form>
    );
}