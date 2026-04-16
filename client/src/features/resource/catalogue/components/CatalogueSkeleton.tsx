import { Skeleton } from '@/components/ui/skeleton'

// Column widths mirror the actual table proportions — use index-based keys
const COL_WIDTHS = ['w-52', 'w-28', 'w-16', 'w-16', 'w-12', 'w-12', 'w-12']

const CatalogueSkeleton = () => {
    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex items-center gap-6 px-4 py-2.5 border-b border-border">
                {COL_WIDTHS.map((w, i) => (
                    <Skeleton key={`col-${w}-${i}`} className={`h-2.5 rounded-sm ${w}`} />
                ))}
            </div>
            {/* Rows */}
            {Array.from({ length: 10 }, (_, i) => (
                <div
                    key={`skel-${i}`}
                    className={`flex items-center gap-6 px-4 py-3.5 border-b border-border/60 last:border-0 ${
                        i % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                    }`}
                >
                    <Skeleton className="h-3.5 rounded-sm w-44" />
                    <Skeleton className="h-3 rounded-sm w-20" />
                    <Skeleton className="h-3 rounded-sm w-10" />
                    <Skeleton className="h-3 rounded-sm w-8" />
                </div>
            ))}
        </div>
    )
}

export default CatalogueSkeleton
