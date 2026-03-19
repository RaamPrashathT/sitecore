import { Skeleton } from "@/components/ui/skeleton";

const PhaseCreationFormSkeleton = () => {
    return (
        <div className="flex items-center justify-center w-full">
            <div className="w-full max-w-3xl">
                {/* Title */}
                <Skeleton className="h-10 w-48 my-8" />

                <div className="flex flex-col gap-y-8">
                    {/* Row 1 */}
                    <div className="flex gap-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>

                    {/* Description */}
                    <Skeleton className="h-24 w-full" />

                    {/* Dates */}
                    <div className="flex gap-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>

                    {/* Button */}
                    <div className="flex justify-end mt-10">
                        <Skeleton className="h-10 w-60" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PhaseCreationFormSkeleton;
