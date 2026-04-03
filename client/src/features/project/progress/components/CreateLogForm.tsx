import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Removed useSearchParams
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAddSiteLog } from "../hooks/useAddSiteLog";
import { uploadToCloudinary } from "@/lib/cloudinary"; 
import { format } from "date-fns";
import { cn } from "@/lib/utils";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Loader2, ArrowLeft, ImagePlus, X, AlertCircle, CalendarIcon } from "lucide-react";

const siteLogSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    workDate: z.date({ required_error: "Work date is required" }),
});

type FormValues = z.infer<typeof siteLogSchema>;

const GRID = { p: "p-6", gap: "gap-6", gapSm: "gap-2", radius: "rounded-lg" };

export default function AddSiteLogForm() {
    // Extract phaseSlug from the URL parameters
    const { orgSlug, projectSlug, phaseSlug } = useParams<{ 
        orgSlug: string; 
        projectSlug: string;
        phaseSlug: string;
    }>();
    
    const navigate = useNavigate();

    // Pass phaseSlug to the hook
    const { mutate: addSiteLog, isPending: isMutating } = useAddSiteLog(orgSlug!, projectSlug!, phaseSlug!);
    
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const { register, handleSubmit, control, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(siteLogSchema),
        defaultValues: {
            title: "",
            description: "",
            workDate: new Date(),
        },
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            if (selectedFiles.length + newFiles.length > 5) {
                setUploadError("You can only upload a maximum of 5 images per log.");
                return;
            }
            setUploadError(null);
            setSelectedFiles((prev) => [...prev, ...newFiles]);
        }
    };

    const removeFile = (indexToRemove: number) => {
        setSelectedFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
        setUploadError(null);
    };

    const onSubmit = async (data: FormValues) => {
        if (!phaseSlug) {
            setUploadError("Phase Slug is missing. Cannot add log.");
            return;
        }

        try {
            setIsUploading(true);
            setUploadError(null);

            const uploadPromises = selectedFiles.map(file => uploadToCloudinary(file));
            const imageUrls = await Promise.all(uploadPromises);

            addSiteLog({
                title: data.title,
                description: data.description,
                workDate: data.workDate.toISOString(),
                images: imageUrls,
            }, {
                // Redirect back to the detailed phase view
                onSuccess: () => navigate(`/${orgSlug}/${projectSlug}/progress/${phaseSlug}`)
            });

        } catch (error) {
            setUploadError("Failed to upload images. Please try again.");
            setIsUploading(false);
        }
    };

    const isBusy = isUploading || isMutating;

    // Safety check for phaseSlug
    if (!phaseSlug) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] bg-stone-50 text-stone-500">
                <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
                <p className="font-medium text-stone-900">Missing Phase Information</p>
                <Button variant="link" onClick={() => navigate(-1)}>Go Back</Button>
            </div>
        );
    }

    return (
        <div className={`min-h-screen bg-stone-50 ${GRID.p} font-sans`}>
            <div className="max-w-3xl mx-auto">
                
                <button 
                    onClick={() => navigate(`/${orgSlug}/${projectSlug}/progress/${phaseSlug}`)}
                    className="flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-stone-900 mb-6 transition-none"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Phase Details
                </button>

                <div className="mb-4">
                    <h1 className="text-3xl font-display text-stone-900 tracking-tight">Add Site Log</h1>
                    <p className="text-sm font-sans text-stone-500 mt-2">Record site progress, upload photos, and flag issues.</p>
                </div>

                <div className={` ${GRID.p} ${GRID.radius} border-t border-stone-200 rounded-none`}>
                    <form onSubmit={handleSubmit(onSubmit)} className={`flex flex-col ${GRID.gap}`}>
                        
                        <div className={`grid grid-cols-1 md:grid-cols-3 ${GRID.gap}`}>
                            <div className={`md:col-span-2 flex flex-col ${GRID.gapSm}`}>
                                <label className="text-xs font-semibold text-stone-500 uppercase tracking-widest">Log Title</label>
                                <Input 
                                    {...register("title")}
                                    disabled={isBusy}
                                    className="font-sans text-stone-900 border-stone-200 focus-visible:ring-green-700"
                                    placeholder="e.g. Concrete poured for North Wing"
                                />
                                {errors.title && <span className="text-xs font-medium text-red-500">{errors.title.message}</span>}
                            </div>

                            <div className={`flex flex-col ${GRID.gapSm}`}>
                                <label className="text-xs font-semibold text-stone-500 uppercase tracking-widest">Work Date</label>
                                <Controller
                                    control={control}
                                    name="workDate"
                                    render={({ field }) => (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    disabled={isBusy}
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal border-stone-200 focus-visible:ring-green-700 bg-transparent",
                                                        !field.value && "text-stone-500"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                />
                                {errors.workDate && <span className="text-xs font-medium text-red-500">{errors.workDate.message}</span>}
                            </div>
                        </div>

                        <div className={`flex flex-col ${GRID.gapSm}`}>
                            <label className="text-xs font-semibold text-stone-500 uppercase tracking-widest">Description</label>
                            <textarea 
                                {...register("description")}
                                disabled={isBusy}
                                className="flex min-h-[100px] w-full rounded-md border border-stone-200 bg-transparent px-3 py-2 text-sm placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-700 disabled:opacity-50"
                                placeholder="Describe the work completed, any delays, or specific observations..."
                            />
                        </div>

                        {/* Image Upload Section */}
                        <div className={`flex flex-col ${GRID.gapSm} pt-2`}>
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-stone-500 uppercase tracking-widest">Site Photos</label>
                                <span className="text-xs font-mono text-stone-400">{selectedFiles.length} / 5</span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                {selectedFiles.map((file, idx) => (
                                    <div key={idx} className="relative aspect-square rounded-md border border-stone-200 overflow-hidden bg-stone-100 group">
                                        <img 
                                            src={URL.createObjectURL(file)} 
                                            alt={`Preview ${idx}`} 
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            disabled={isBusy}
                                            onClick={() => removeFile(idx)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}

                                {selectedFiles.length < 5 && (
                                    <label className={`aspect-square rounded-md border-2 border-dashed border-stone-300 flex flex-col items-center justify-center text-stone-500 hover:text-green-700 hover:border-green-700 hover:bg-green-50/50 cursor-pointer transition-colors ${isBusy ? 'opacity-50 pointer-events-none' : ''}`}>
                                        <ImagePlus className="w-6 h-6 mb-2" />
                                        <span className="text-xs font-medium">Add Photo</span>
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
                            {uploadError && <span className="text-xs font-medium text-red-500 mt-1">{uploadError}</span>}
                        </div>

                        <div className="flex items-center justify-end gap-4 pt-6 mt-4 border-t border-stone-100">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => navigate(`/${orgSlug}/${projectSlug}/progress/${phaseSlug}`)}
                                disabled={isBusy}
                                className="text-xs font-semibold text-stone-500 hover:text-stone-900 uppercase tracking-wider px-6"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isBusy}
                                className="bg-green-700 text-white hover:bg-green-800 text-xs font-semibold uppercase tracking-wider px-8 transition-none"
                            >
                                {isBusy ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" /> 
                                        {isUploading ? "Uploading..." : "Saving..."}
                                    </>
                                ) : "Post Log"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}