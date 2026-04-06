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
import { Camera, X } from "lucide-react"; // Added for a more professional UI

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
                    message: error.response.data.message || "Failed to save profile.",
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
            className={cn("flex flex-col gap-8 w-full max-w-md", className)}
            {...props}
            onSubmit={handleSubmit(onSubmit)}
        >
            <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-display text-slate-900 tracking-tight font-semibold">
                    Complete your profile
                </h1>
                <p className="text-sm font-sans text-slate-500">
                    Finish setting up your account credentials and security.
                </p>
            </div>

            <FieldGroup className="space-y-">
                {/* Profile Photo Section */}
                <Field className="space-y-3">
                    <FieldLabel className="font-sans text-[11px] font-bold uppercase tracking-widest text-slate-500">
                        Profile Image
                    </FieldLabel>

                    <div className="flex items-center gap-5">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={handleFileChange}
                        />

                        <div
                            className="relative shrink-0 group cursor-pointer"
                            onClick={openPicker}
                        >
                            <div className="h-20 w-20 rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center transition-colors group-hover:border-green-700/50 group-hover:bg-green-50/30">
                                {previewUrl ? (
                                    <img
                                        src={previewUrl}
                                        alt="Avatar"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center gap-1">
                                        <Camera className="w-5 h-5 text-slate-400 group-hover:text-green-700" />
                                    </div>
                                )}
                            </div>

                            {previewUrl && (
                                <button
                                    type="button"
                                    onClick={handleRemove}
                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors"
                                >
                                    <X className="w-3 h-3 text-slate-600" />
                                </button>
                            )}
                        </div>

                        <div className="space-y-1">
                            <p className="font-sans text-sm font-semibold text-slate-900">
                                {previewUrl ? "Image ready" : "Upload photo"}
                            </p>
                            <p className="font-sans text-xs text-slate-500 leading-relaxed">
                                JPG, PNG or WEBP · max 2 MB
                            </p>
                            {avatarError && (
                                <p className="font-mono text-[10px] font-bold text-destructive uppercase tracking-tighter">
                                    {avatarError}
                                </p>
                            )}
                        </div>
                    </div>
                </Field>

                <div className="grid grid-cols-1 gap-5">
                    {/* Username */}
                    <Field className="">
                        <FieldLabel className="font-sans text-[11px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1">
                            Username <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                            {...register("username")}
                            className="font-sans focus:ring-green-700/20 focus:border-green-700"
                            placeholder="Enter username"
                        />
                        {errors.username && (
                            <FieldError className="font-mono text-[10px] font-bold uppercase tracking-tighter">
                                {errors.username.message}
                            </FieldError>
                        )}
                    </Field>

                    {/* Phone */}
                    <Field className="">
                        <FieldLabel className="font-sans text-[11px] font-bold uppercase tracking-widest text-slate-500">
                            Phone Number
                        </FieldLabel>
                        <Input
                            {...register("phone")}
                            type="tel"
                            placeholder="+91 00000 00000"
                            className="font-mono text-sm tracking-tight focus:ring-green-700/20 focus:border-green-700"
                        />
                        {errors.phone && (
                            <FieldError className="font-mono text-[10px] font-bold uppercase tracking-tighter">
                                {errors.phone.message}
                            </FieldError>
                        )}
                    </Field>
                </div>

                {/* Security Section */}
                <div className="space-y-3">
                    <p className="font-sans text-[11px] font-bold uppercase tracking-widest text-slate-500">
                        Security Settings
                    </p>
                    <div className="rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <FieldLabel
                                    htmlFor="isTwoFactorEnabled"
                                    className="font-sans text-sm font-semibold text-slate-900 cursor-pointer"
                                >
                                    Two-factor authentication
                                </FieldLabel>
                                <p className="font-sans text-xs text-slate-500">
                                    Verify your identity via mobile app.
                                </p>
                            </div>
                            <Controller
                                name="isTwoFactorEnabled"
                                control={control}
                                render={({ field }) => (
                                    <Switch
                                        id="isTwoFactorEnabled"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        className="data-[state=checked]:bg-green-700"
                                    />
                                )}
                            />
                        </div>
                    </div>
                </div>

                {errors.root && (
                    <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                        <p className="text-center font-mono text-[10px] font-bold uppercase text-destructive">
                            {errors.root.message}
                        </p>
                    </div>
                )}

                <Button
                    type="submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <span className="flex items-center gap-2">
                            <Spinner className="w-4 h-4 border-white/30 border-t-white" /> 
                            Updating Profile...
                        </span>
                    ) : (
                        "Complete Setup"
                    )}
                </Button>
            </FieldGroup>
        </form>
    );
}