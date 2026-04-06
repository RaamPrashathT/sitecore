import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Building2, Camera, X } from "lucide-react";
import api from "@/lib/axios";
import { uploadToCloudinary } from "@/lib/cloudinary";

// ─── Types ────────────────────────────────────────────────────────────────────

type OrgSettings = {
    id: string;
    name: string;
    slug: string;
    image: string | null;
    createdAt: string;
};

type FormErrors = {
    name?: string;
    image?: string;
    root?: string;
};

// ─── API calls ────────────────────────────────────────────────────────────────

const fetchSettings = async (): Promise<OrgSettings> => {
    const res = await api.get("/org/settings");
    return res.data;
};

const patchSettings = async (data: {
    name?: string;
    image?: string;
}): Promise<OrgSettings> => {
    const res = await api.patch("/org/settings", data);
    return res.data;
};

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(name: string, hasImage: boolean): FormErrors {
    const errors: FormErrors = {};

    if (name && (name.trim().length < 3 || name.trim().length > 80)) {
        errors.name = "Name must be between 3 and 80 characters";
    }

    if (!name.trim() && !hasImage) {
        errors.root = "At least one field must be filled";
    }

    return errors;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const SettingsPage = () => {
    const queryClient = useQueryClient();

    const [name, setName] = useState("");
    const [errors, setErrors] = useState<FormErrors>({});

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageError, setImageError] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["org-settings"],
        queryFn: fetchSettings,
    });

    const mutation = useMutation({
        mutationFn: patchSettings,
        onSuccess: (updated) => {
            queryClient.setQueryData(["org-settings"], updated);
            setName("");
            setPreviewUrl(null);
            setImageFile(null);
            setErrors({});
        },
        onError: (err: Error) => {
            setErrors({ root: err.message });
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

        setImageError("");

        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            setImageError("JPG, PNG or WEBP only.");
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setImageError("Must be under 2 MB.");
            return;
        }

        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(URL.createObjectURL(file));
        setImageFile(file);
        setErrors((prev) => ({ ...prev, root: undefined }));
    }

    function handleRemove(e: React.MouseEvent) {
        e.stopPropagation();
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setImageFile(null);
        setImageError("");
    }

    const handleSubmit = async () => {
        const validationErrors = validate(name, !!imageFile);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        const payload: { name?: string; image?: string } = {};
        if (name.trim()) payload.name = name.trim();

        if (imageFile) {
            try {
                setIsUploading(true);
                const url = await uploadToCloudinary(imageFile);
                payload.image = url;
            } catch {
                setErrors({
                    root: "Failed to upload image. Please try again.",
                });
                return;
            } finally {
                setIsUploading(false);
            }
        }

        mutation.mutate(payload);
    };

    const isPending = isUploading || mutation.isPending;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[300px]">
                <Loader2 className="animate-spin text-green-700 size-6" />
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="flex items-center justify-center min-h-[300px] text-sm text-red-500">
                Failed to load settings.
            </div>
        );
    }

    // The avatar to show in the picker — prefer local preview, then existing
    const currentAvatar = previewUrl ?? data.image;

    return (
        <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">
            {/* Header */}
            <div className="space-y-1">
                <h1
                    className="text-2xl font-semibold tracking-tight text-green-700"
                    style={{ fontFamily: "sans-serif" }}
                >
                    Organization Settings
                </h1>
                <p className="text-sm text-muted-foreground">
                    Manage your organization's profile.
                </p>
            </div>

            <div className="space-y-5">
                <div className="space-y-5">
                    {/* Logo uploader */}
                    <div className="space-y-3">
                        <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                            Organization Logo
                        </Label>

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
                                    {currentAvatar ? (
                                        <img
                                            src={currentAvatar}
                                            alt="Logo"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center gap-1">
                                            <Building2 className="w-5 h-5 text-slate-400 group-hover:text-green-700" />
                                        </div>
                                    )}
                                </div>

                                {/* Camera overlay */}
                                {currentAvatar && (
                                    <div className="absolute inset-0 rounded-2xl bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Camera className="w-5 h-5 text-white" />
                                    </div>
                                )}

                                {/* Remove button — only for newly selected file */}
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
                                <p className="text-sm font-semibold text-slate-900">
                                    {previewUrl
                                        ? "Image ready to upload"
                                        : "Upload logo"}
                                </p>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    JPG, PNG or WEBP · max 2 MB
                                </p>
                                {imageError && (
                                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">
                                        {imageError}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Name */}
                    <div className="space-y-1.5">
                        <Label htmlFor="org-name">Name</Label>
                        <Input
                            id="org-name"
                            placeholder={data.name}
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setErrors((prev) => ({
                                    ...prev,
                                    name: undefined,
                                    root: undefined,
                                }));
                            }}
                        />
                        {errors.name && (
                            <p className="text-xs text-red-500">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {errors.root && (
                        <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                            <p className="text-[10px] font-bold uppercase tracking-tighter text-red-500">
                                {errors.root}
                            </p>
                        </div>
                    )}
                    <div className="flex justify-end">
                        <Button
                            onClick={handleSubmit}
                            disabled={isPending}
                            className="bg-green-700 hover:bg-green-800 text-white w-60"
                        >
                            {isPending && (
                                <Loader2 className="mr-2 size-4 animate-spin" />
                            )}
                            {isUploading
                                ? "Uploading..."
                                : mutation.isPending
                                  ? "Saving..."
                                  : "Save Changes"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
