export default function ProjectDetailsSkeleton() {
    return (
        <div className="min-h-screen bg-stone-50 p-6 animate-pulse font-sans">

            {/* Header */}
            <div className="mb-8 flex justify-between items-start">
                <div className="flex flex-col gap-3">
                    <div className="h-10 w-64 bg-slate-200 rounded" />
                    <div className="h-4 w-96 bg-slate-200 rounded" />
                </div>
                <div className="h-6 w-24 bg-slate-200 rounded" />
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white border border-slate-200 p-6 rounded-lg">
                        <div className="h-3 w-32 bg-slate-200 rounded mb-4" />
                        <div className="h-10 w-40 bg-slate-200 rounded mb-2" />
                        <div className="h-3 w-24 bg-slate-200 rounded" />
                    </div>
                ))}
            </div>

            {/* Middle Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

                {/* Budget Panel */}
                <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-lg">
                    <div className="h-4 w-40 bg-slate-200 rounded mb-6" />

                    <div className="h-2 w-full bg-slate-200 rounded mb-6" />

                    <div className="grid grid-cols-2 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-stone-50 p-4 border border-slate-100 rounded-sm">
                                <div className="h-3 w-24 bg-slate-200 rounded mb-2" />
                                <div className="h-6 w-20 bg-slate-200 rounded" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pipeline */}
                <div className="bg-white border border-slate-200 p-6 rounded-lg">
                    <div className="h-4 w-40 bg-slate-200 rounded mb-6" />
                    <div className="flex flex-col gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex gap-4">
                                <div className="w-3 h-3 bg-slate-200 rounded-full mt-2" />
                                <div className="flex-1">
                                    <div className="h-4 w-32 bg-slate-200 rounded mb-2" />
                                    <div className="h-2 w-full bg-slate-200 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white border border-slate-200 p-5 rounded-lg flex gap-4">
                        <div className="w-10 h-10 bg-slate-200 rounded" />
                        <div className="flex flex-col gap-2">
                            <div className="h-3 w-24 bg-slate-200 rounded" />
                            <div className="h-6 w-16 bg-slate-200 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}