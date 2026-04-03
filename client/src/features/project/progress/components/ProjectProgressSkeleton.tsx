import { Skeleton } from "@/components/ui/skeleton";

const ProjectProgressSkeleton = () => {
    return (
        <main className="max-w-4xl mx-auto px-8 pb-32 pt-8">
            {/* Header Section */}
            <section className="mb-8">
                <Skeleton className="w-64 h-12 rounded-md" />

                <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-8 sm:gap-0">
                    <div className="flex gap-12">
                        <div className="space-y-2">
                            <Skeleton className="w-32 h-3 rounded-md" />
                            <Skeleton className="w-48 h-8 rounded-md" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="w-24 h-3 rounded-md" />
                            <Skeleton className="w-16 h-8 rounded-md" />
                        </div>
                    </div>

                    <Skeleton className="w-32 h-8 rounded-md" />
                </div>
            </section>

            {/* Timeline Cards */}
            <div className="relative pl-12 space-y-24 mt-16">
                {/* Continuous vertical line */}
                <div className="absolute left-[11px] top-0 bottom-0 w-px bg-stone-200"></div>

                {/* Generate 3 placeholder phase cards */}
                {[1, 2, 3].map((i) => (
                    <article key={i} className="relative">
                        {/* Node Indicator */}
                        <div className="absolute -left-12 top-0 flex items-center justify-center w-6 h-6 z-10 bg-stone-50 rounded-full">
                            <Skeleton className="w-3 h-3 rounded-full" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                            {/* Left Side: Phase Info */}
                            <div className="md:col-span-4">
                                <Skeleton className="w-16 h-12 mb-3 rounded-md" />
                                <Skeleton className="w-48 h-10 rounded-md" />

                                <div className="mt-4 flex gap-3">
                                    <Skeleton className="w-16 h-5 rounded-sm" />
                                    <Skeleton className="w-24 h-5 rounded-sm" />
                                </div>

                                <Skeleton className="w-32 h-8 mt-6 rounded-md" />
                            </div>

                            {/* Right Side: Latest Activity Box */}
                            <div className="md:col-span-8">
                                <Skeleton className="w-full h-[200px] rounded-lg" />
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </main>
    );
};

export default ProjectProgressSkeleton;