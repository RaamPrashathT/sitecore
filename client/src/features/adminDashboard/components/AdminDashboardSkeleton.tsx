import { Skeleton } from "@/components/ui/skeleton";

const AdminDashboardSkeleton = () => {
    return (
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 px-4 lg:px-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-2">
                <div>
                    <Skeleton className="h-3 w-32 mb-2" />
                    <Skeleton className="h-8 w-56" />
                    <Skeleton className="h-3.5 w-40 mt-2" />
                </div>
                <Skeleton className="h-9 w-[280px] rounded-full" />
            </div>

            {/* Section header */}
            <div className="flex items-center gap-2.5">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-4" />
                <div className="flex-1 h-px bg-slate-100" />
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-3">
                {Array.from({ length: 4 }, (_, index) => (
                    <div
                        key={index}
                        className="rounded-2xl ring-1 ring-slate-200/80 bg-white p-5 shadow-sm"
                    >
                        {/* Title + badges */}
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex-1">
                                <Skeleton className="h-5 w-44 mb-2" />
                                <div className="flex gap-2">
                                    <Skeleton className="h-4 w-16 rounded-full" />
                                    <Skeleton className="h-4 w-24 rounded-full" />
                                </div>
                            </div>
                            <div className="hidden lg:flex flex-col gap-1 items-end">
                                <Skeleton className="h-3 w-28" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                        </div>

                        {/* Metadata row */}
                        <div className="flex gap-4 mb-4 pb-4 border-b border-slate-100">
                            <Skeleton className="h-3 w-28" />
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-3 w-24" />
                        </div>

                        {/* Stats grid */}
                        <div className="grid grid-cols-3 gap-2.5 mb-4">
                            <Skeleton className="h-[72px] rounded-xl" />
                            <Skeleton className="h-[72px] rounded-xl" />
                            <Skeleton className="h-[72px] rounded-xl" />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <Skeleton className="h-9 w-32 rounded-lg" />
                            <Skeleton className="h-9 w-36 rounded-lg" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboardSkeleton;
