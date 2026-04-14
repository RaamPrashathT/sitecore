import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

import { useCreateSiteLog } from "../hooks/useSiteLog";
import { usePhaseAllRequisitions } from "@/features/project/requisition/hooks/usePhaseAllRequisitions";
import { useGetInventoryBalances } from "@/features/catalogue/hooks/useInventoryLocation";
import { uploadToCloudinary } from "@/lib/cloudinary";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ArrowLeft,
    CalendarIcon,
    ImagePlus,
    Loader2,
    Plus,
    Trash2,
    X,
    PackagePlus,
} from "lucide-react";

// ─── Schema ───────────────────────────────────────────────────────────────────

const materialRowSchema = z.object({
    catalogueId: z.string().min(1, "Select a material"),
    locationId: z.string().min(1, "Select a location"),
    quantity: z.coerce
        .number({ error: "Enter a quantity" })
        .positive("Quantity must be greater than 0"),
});

const siteLogSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    workDate: z.date({ error: "Work date is required" }),
    materialsConsumed: z.array(materialRowSchema),
});

type FormValues = z.infer<typeof siteLogSchema>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getLocationPlaceholder(catalogueId: string, count: number): string {
    if (!catalogueId) return "Select material first";
    if (count === 0) return "No stock available";
    return "Select location...";
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SiteLogForm() {
    const { orgSlug, projectSlug, phaseSlug } = useParams<{
        orgSlug: string;
        projectSlug: string;
        phaseSlug: string;
    }>();
    const navigate = useNavigate();

    const { mutateAsync: createSiteLog, isPending: isMutating } =
        useCreateSiteLog(orgSlug!, projectSlug!, phaseSlug!);

    const { data: requisitionsData } = usePhaseAllRequisitions(
        orgSlug,
        projectSlug,
        phaseSlug,
    );
    const { data: inventoryBalances } = useGetInventoryBalances();

    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    // Filter: only APPROVED requisitions with ORDERED items
    const eligibleMaterials = (requisitionsData?.requisitions ?? [])
        .filter((req) => req.status === "APPROVED")
        .flatMap((req) =>
            req.items
                .filter((item) => item.status === "ORDERED")
                .map((item) => ({
                    catalogueId: item.catalogueId,
                    label: `${item.itemName} (${item.unit})`,
                })),
        )
        // deduplicate by catalogueId
        .filter(
            (item, idx, arr) =>
                arr.findIndex((i) => i.catalogueId === item.catalogueId) ===
                idx,
        );

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(siteLogSchema),
        defaultValues: {
            title: "",
            description: "",
            workDate: new Date(),
            materialsConsumed: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "materialsConsumed",
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const newFiles = Array.from(e.target.files);
        if (selectedFiles.length + newFiles.length > 5) {
            setUploadError("Maximum 5 images per log.");
            return;
        }
        setUploadError(null);
        setSelectedFiles((prev) => [...prev, ...newFiles]);
    };

    const removeFile = (idx: number) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
        setUploadError(null);
    };

    const onSubmit = async (data: FormValues) => {
        try {
            setIsUploading(true);
            setUploadError(null);

            const imageUrls = await Promise.all(
                selectedFiles.map((f) => uploadToCloudinary(f)),
            );

            await createSiteLog({
                title: data.title,
                description: data.description,
                workDate: data.workDate,
                images: imageUrls,
                materialsConsumed: data.materialsConsumed.map((m) => ({
                    catalogueId: m.catalogueId,
                    locationId: m.locationId,
                    quantity: Number(m.quantity),
                })),
            });

            navigate(`/${orgSlug}/${projectSlug}/progress/${phaseSlug}`);
        } catch {
            setUploadError("Submission failed. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const isBusy = isUploading || isMutating;

    return (
        <div className="min-h-screen bg-stone-50 p-4 md:p-8">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <button
                        onClick={() =>
                            navigate(
                                `/${orgSlug}/${projectSlug}/progress/${phaseSlug}`,
                            )
                        }
                        className="flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-stone-900 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Phase
                    </button>
                    <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">
                        New Site Log
                    </h1>
                    <p className="text-sm text-stone-500 mt-1">
                        Record daily progress and materials consumed on-site.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-6"
                    noValidate
                >
                    {/* ── Section A: Basic Details ── */}
                    <section className="bg-white border border-stone-200 rounded-xl p-5 md:p-6 space-y-5">
                        <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest">
                            Basic Details
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Title */}
                            <div className="md:col-span-2 space-y-1.5">
                                <label className="text-sm font-medium text-stone-700">
                                    Log Title{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    {...register("title")}
                                    disabled={isBusy}
                                    placeholder="e.g. Concrete poured for North Wing"
                                    className="border-stone-200 focus-visible:ring-green-700"
                                />
                                {errors.title && (
                                    <p className="text-xs text-red-500">
                                        {errors.title.message}
                                    </p>
                                )}
                            </div>

                            {/* Work Date */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-stone-700">
                                    Work Date{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <Controller
                                    control={control}
                                    name="workDate"
                                    render={({ field }) => (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    disabled={isBusy}
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal border-stone-200",
                                                        !field.value &&
                                                            "text-stone-400",
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                                                    {field.value
                                                        ? format(
                                                              field.value,
                                                              "PPP",
                                                          )
                                                        : "Pick a date"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent
                                                className="w-auto p-0"
                                                align="start"
                                            >
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(d) =>
                                                        d > new Date()
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                />
                                {errors.workDate && (
                                    <p className="text-xs text-red-500">
                                        {errors.workDate.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                            <label
                                htmlFor="description"
                                className="text-sm font-medium text-stone-700"
                            >
                                Description
                            </label>
                            <Textarea
                                id="description"
                                {...register("description")}
                                disabled={isBusy}
                                placeholder="Describe the work completed, any delays, or observations..."
                                className="min-h-[100px] border-stone-200 focus-visible:ring-green-700 resize-none"
                            />
                        </div>

                        {/* Images */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-stone-700">
                                    Site Photos
                                </span>
                                <span className="text-xs text-stone-400 font-mono">
                                    {selectedFiles.length} / 5
                                </span>
                            </div>
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                                {selectedFiles.map((file, idx) => (
                                    <div
                                        key={`${file.name}-${file.lastModified}-${idx}`}
                                        className="relative aspect-square rounded-lg border border-stone-200 overflow-hidden bg-stone-100 group"
                                    >
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={`Preview ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            disabled={isBusy}
                                            onClick={() => removeFile(idx)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                                {selectedFiles.length < 5 && (
                                    <label
                                        className={cn(
                                            "aspect-square rounded-lg border-2 border-dashed border-stone-300 flex flex-col items-center justify-center text-stone-400 hover:text-green-700 hover:border-green-700 hover:bg-green-50/50 cursor-pointer transition-colors",
                                            isBusy &&
                                                "opacity-50 pointer-events-none",
                                        )}
                                    >
                                        <ImagePlus className="w-5 h-5 mb-1" />
                                        <span className="text-xs font-medium">
                                            Add
                                        </span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="hidden"
                                            onChange={handleFileChange}
                                            disabled={isBusy}
                                        />
                                    </label>
                                )}
                            </div>
                            {uploadError && (
                                <p className="text-xs text-red-500">
                                    {uploadError}
                                </p>
                            )}
                        </div>
                    </section>

                    {/* ── Section B: Material Consumption ── */}
                    <section className="bg-white border border-stone-200 rounded-xl p-5 md:p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest">
                                    Materials Consumed
                                </h2>
                                <p className="text-xs text-stone-400 mt-0.5">
                                    Only approved &amp; ordered materials are
                                    available.
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={
                                    isBusy || eligibleMaterials.length === 0
                                }
                                onClick={() =>
                                    append({
                                        catalogueId: "",
                                        locationId: "",
                                        quantity: 0,
                                    })
                                }
                                className="border-stone-200 text-stone-700 hover:bg-stone-50 text-xs gap-1.5"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Add Material
                            </Button>
                        </div>

                        {eligibleMaterials.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-8 text-stone-400 border border-dashed border-stone-200 rounded-lg">
                                <PackagePlus className="w-8 h-8 mb-2 opacity-40" />
                                <p className="text-sm font-medium">
                                    No eligible materials
                                </p>
                                <p className="text-xs mt-0.5">
                                    Approved requisitions with ordered items
                                    will appear here.
                                </p>
                            </div>
                        )}

                        {fields.length > 0 && (
                            <div className="space-y-3">
                                {/* Column headers — hidden on mobile */}
                                <div className="hidden md:grid md:grid-cols-[1fr_1fr_120px_40px] gap-3 px-1">
                                    <span className="text-xs font-medium text-stone-400">
                                        Material
                                    </span>
                                    <span className="text-xs font-medium text-stone-400">
                                        Location
                                    </span>
                                    <span className="text-xs font-medium text-stone-400">
                                        Quantity
                                    </span>
                                    <span />
                                </div>

                                {fields.map((field, idx) => (
                                    <div
                                        key={field.id}
                                        className="grid grid-cols-1 md:grid-cols-[1fr_1fr_120px_40px] gap-3 p-3 md:p-0 bg-stone-50 md:bg-transparent rounded-lg md:rounded-none border border-stone-100 md:border-0"
                                    >
                                        {/* Material Select */}
                                        <div className="space-y-1 md:space-y-0">
                                            <span className="text-xs text-stone-500 md:hidden block">
                                                Material
                                            </span>
                                            <Controller
                                                control={control}
                                                name={`materialsConsumed.${idx}.catalogueId`}
                                                render={({ field: f }) => (
                                                    <Select
                                                        value={f.value}
                                                        onValueChange={(val) => {
                                                            f.onChange(val);
                                                            // reset location when material changes
                                                            setValue(`materialsConsumed.${idx}.locationId`, "");
                                                        }}
                                                        disabled={isBusy}
                                                    >
                                                        <SelectTrigger className="border-stone-200 focus:ring-green-700 bg-white text-sm">
                                                            <SelectValue placeholder="Select material..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {eligibleMaterials.map((m) => (
                                                                <SelectItem key={m.catalogueId} value={m.catalogueId}>
                                                                    {m.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                            {errors.materialsConsumed?.[idx]
                                                ?.catalogueId && (
                                                <p className="text-xs text-red-500">
                                                    {
                                                        errors
                                                            .materialsConsumed[
                                                            idx
                                                        ]?.catalogueId?.message
                                                    }
                                                </p>
                                            )}
                                        </div>

                                        {/* Location Select */}
                                        <div className="space-y-1 md:space-y-0">
                                            <span className="text-xs text-stone-500 md:hidden block">
                                                Location
                                            </span>
                                            <Controller
                                                control={control}
                                                name={`materialsConsumed.${idx}.locationId`}
                                                render={({ field: f }) => {
                                                    const selectedCatalogueId = watch(`materialsConsumed.${idx}.catalogueId`);
                                                    const availableLocations = (inventoryBalances ?? [])
                                                        .filter(
                                                            (item) =>
                                                                item.catalogueId === selectedCatalogueId &&
                                                                item.quantityOnHand > 0,
                                                        )
                                                        .map((item) => item.location);

                                                    return (
                                                        <Select
                                                            value={f.value}
                                                            onValueChange={f.onChange}
                                                            disabled={isBusy || !selectedCatalogueId}
                                                        >
                                                            <SelectTrigger className="border-stone-200 focus:ring-green-700 bg-white text-sm">
                                                                <SelectValue
                                                                    placeholder={
                                                                        getLocationPlaceholder(selectedCatalogueId, availableLocations.length)
                                                                    }
                                                                />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {availableLocations.map((loc) => (
                                                                    <SelectItem key={loc.id} value={loc.id}>
                                                                        {loc.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    );
                                                }}
                                            />
                                            {errors.materialsConsumed?.[idx]
                                                ?.locationId && (
                                                <p className="text-xs text-red-500">
                                                    {
                                                        errors
                                                            .materialsConsumed[
                                                            idx
                                                        ]?.locationId?.message
                                                    }
                                                </p>
                                            )}
                                        </div>

                                        {/* Quantity */}
                                        <div className="space-y-1 md:space-y-0">
                                            <label
                                                htmlFor={`qty-${idx}`}
                                                className="text-xs text-stone-500 md:hidden block"
                                            >
                                                Quantity
                                            </label>
                                            <Input
                                                id={`qty-${idx}`}
                                                type="number"
                                                min="0.01"
                                                step="any"
                                                disabled={isBusy}
                                                {...register(
                                                    `materialsConsumed.${idx}.quantity`,
                                                )}
                                                className="border-stone-200 focus-visible:ring-green-700 bg-white"
                                                placeholder="0"
                                            />
                                            {errors.materialsConsumed?.[idx]
                                                ?.quantity && (
                                                <p className="text-xs text-red-500">
                                                    {
                                                        errors
                                                            .materialsConsumed[
                                                            idx
                                                        ]?.quantity?.message
                                                    }
                                                </p>
                                            )}
                                        </div>

                                        {/* Remove */}
                                        <div className="flex items-start md:items-center justify-end md:justify-center">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                disabled={isBusy}
                                                onClick={() => remove(idx)}
                                                className="h-9 w-9 text-stone-400 hover:text-red-500 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* ── Actions ── */}
                    <div className="flex items-center justify-end gap-3 pb-8">
                        <Button
                            type="button"
                            variant="ghost"
                            disabled={isBusy}
                            onClick={() =>
                                navigate(
                                    `/${orgSlug}/${projectSlug}/progress/${phaseSlug}`,
                                )
                            }
                            className="text-stone-500 hover:text-stone-900"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isBusy}
                            className="bg-green-700 hover:bg-green-800 text-white px-8 min-w-[120px]"
                        >
                            {isBusy ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    {isUploading ? "Uploading..." : "Saving..."}
                                </>
                            ) : (
                                "Post Log"
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
