import { Skeleton } from "@/components/ui/skeleton";

const ProjectPhaseSkeleton = () => {
    return (
        <main className="max-w-4xl mx-auto px-8 pb-32 pt-8">
            {/* Phase Header Section */}
            <section className="mb-8">
                <div className="flex justify-between items-center">
                    <div className="flex items-baseline gap-4 mb-2 w-full">
                        <Skeleton className="w-10 h-10 rounded-md" />
                        <Skeleton className="w-3/5 h-12 rounded-md" />
                        <Skeleton className="w-20 h-5 rounded-full self-center" />
                    </div>
                    <Skeleton className="w-24 h-8 rounded-md shrink-0" />
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mt-8 py-6 border-y border-stone-200">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="space-y-3">
                            <Skeleton className="w-24 h-3 rounded-md" />
                            <Skeleton className="w-32 h-6 rounded-md" />
                        </div>
                    ))}
                </div>

                {/* Actions Row */}
                <div className="flex justify-between items-center mt-6">
                    <Skeleton className="w-28 h-9 rounded-lg" />
                    <Skeleton className="w-32 h-9 rounded-lg" />
                </div>
            </section>

            {/* Vertical Activity Feed (Logs) */}
            <div className="space-y-24 relative min-h-[400px] mt-16">
                {/* Continuous vertical line */}
                <div className="absolute left-0 top-0 bottom-0 w-px bg-stone-200 hidden md:block"></div>

                {/* Generate 2 placeholder site logs */}
                {[1, 2].map((i) => (
                    <article key={i} className="relative pl-4">
                        <div className="flex flex-col md:flex-row gap-16">
                            
                            {/* Left Side: Sidebar Info */}
                            <div className="md:w-1/4 space-y-3">
                                <Skeleton className="w-32 h-3 rounded-md" />
                                <Skeleton className="w-full h-8 rounded-md" />
                                
                                <div className="flex items-center gap-2 mt-4">
                                    <Skeleton className="w-6 h-6 rounded-full shrink-0" />
                                    <Skeleton className="w-24 h-4 rounded-md" />
                                </div>
                            </div>

                            {/* Right Side: Log Content */}
                            <div className="md:w-3/4">
                                {/* Description Lines */}
                                <div className="space-y-2 mb-8">
                                    <Skeleton className="w-full h-4 rounded-md" />
                                    <Skeleton className="w-11/12 h-4 rounded-md" />
                                    <Skeleton className="w-4/5 h-4 rounded-md" />
                                </div>

                                {/* Images Scroller Placeholder */}
                                <div className="flex gap-4 overflow-hidden mb-4">
                                    <Skeleton className="shrink-0 rounded-xl aspect-4/3 w-[280px]" />
                                    <Skeleton className="shrink-0 rounded-xl aspect-4/3 w-[280px]" />
                                </div>

                                {/* Comments Section */}
                                <div className="mt-8 pt-8 border-t border-stone-200 space-y-6">
                                    {/* Placeholder Comment */}
                                    <div className="flex gap-4">
                                        <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Skeleton className="w-24 h-3 rounded-md" />
                                                <Skeleton className="w-12 h-2 rounded-md" />
                                            </div>
                                            <Skeleton className="w-3/4 h-4 rounded-md" />
                                        </div>
                                    </div>

                                    {/* Input Placeholder */}
                                    <div className="flex gap-3 items-end pt-4">
                                        <Skeleton className="w-[42px] h-[42px] rounded-lg shrink-0" />
                                        <Skeleton className="grow h-[42px] rounded-lg" />
                                        <Skeleton className="w-[80px] h-[42px] rounded-lg shrink-0" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </main>
    );
};

export default ProjectPhaseSkeleton;